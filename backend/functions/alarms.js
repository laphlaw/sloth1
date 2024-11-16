const { withAuth, formatResponse } = require('../lib/auth');
const { getAlarms, createAlarm, updateAlarm } = require('../lib/dynamodb');
const haversine = require('haversine-distance');

// Create a new alarm
exports.create = withAuth(async (event) => {
  try {
    const { time, location, amount } = JSON.parse(event.body);
    const userId = event.user.uid;

    // Validate input
    if (!time || !location || !amount) {
      return formatResponse(400, {
        message: 'Missing required fields'
      });
    }

    // Create alarm
    const alarm = await createAlarm(userId, {
      time,
      location,
      amount: parseFloat(amount),
      active: true,
      completed: false,
      failed: false
    });

    return formatResponse(200, alarm);
  } catch (error) {
    console.error('Create alarm error:', error);
    return formatResponse(500, {
      message: 'Failed to create alarm'
    });
  }
});

// List user's alarms
exports.list = withAuth(async (event) => {
  try {
    const userId = event.user.uid;
    const alarms = await getAlarms(userId);

    return formatResponse(200, alarms);
  } catch (error) {
    console.error('List alarms error:', error);
    return formatResponse(500, {
      message: 'Failed to fetch alarms'
    });
  }
});

// Check if user is at the required location
exports.checkLocation = withAuth(async (event) => {
  try {
    const { alarmId, currentLocation } = JSON.parse(event.body);
    const userId = event.user.uid;

    // Get the alarm
    const alarms = await getAlarms(userId);
    const alarm = alarms.find(a => a.id === alarmId);

    if (!alarm) {
      return formatResponse(404, {
        message: 'Alarm not found'
      });
    }

    // Calculate distance between current location and target location
    const distance = haversine(
      { lat: currentLocation.lat, lon: currentLocation.lng },
      { lat: alarm.location.lat, lon: alarm.location.lng }
    );

    // Check if within 50 meters of target location
    const isAtLocation = distance <= 50;

    if (isAtLocation) {
      // Update alarm as completed
      await updateAlarm(userId, alarmId, {
        completed: true,
        active: false
      });

      return formatResponse(200, {
        success: true,
        message: 'Location verified successfully'
      });
    }

    return formatResponse(200, {
      success: false,
      message: 'Not at required location',
      distance: Math.round(distance)
    });
  } catch (error) {
    console.error('Check location error:', error);
    return formatResponse(500, {
      message: 'Failed to verify location'
    });
  }
});

// Process expired alarms (called by CloudWatch Events)
exports.processExpiredAlarms = async (event) => {
  try {
    const now = new Date();
    const { Items: allAlarms } = await getAlarms();
    
    const expiredAlarms = allAlarms.filter(alarm => {
      return alarm.active && 
             !alarm.completed && 
             new Date(alarm.time) < now;
    });

    for (const alarm of expiredAlarms) {
      await updateAlarm(alarm.userId, alarm.id, {
        active: false,
        failed: true
      });

      // Trigger payment processing for failed alarm
      // This will be handled by a separate payment processing function
      await processPayment(alarm);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        processed: expiredAlarms.length
      })
    };
  } catch (error) {
    console.error('Process expired alarms error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to process expired alarms'
      })
    };
  }
};

async function processPayment(alarm) {
  // This function will be implemented in the payments.js file
  const AWS = require('aws-sdk');
  const lambda = new AWS.Lambda();

  await lambda.invoke({
    FunctionName: `${process.env.SERVICE_NAME}-${process.env.STAGE}-processPayment`,
    InvocationType: 'Event',
    Payload: JSON.stringify({
      alarmId: alarm.id,
      userId: alarm.userId,
      amount: alarm.amount
    })
  }).promise();
}
