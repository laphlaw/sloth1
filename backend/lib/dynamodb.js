const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDB({});
const dynamo = DynamoDBDocument.from(client);

const ALARMS_TABLE = `${process.env.SERVICE_NAME}-${process.env.STAGE}-alarms`;
const USERS_TABLE = `${process.env.SERVICE_NAME}-${process.env.STAGE}-users`;

const getAlarms = async (userId) => {
  const params = {
    TableName: ALARMS_TABLE,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };

  try {
    const result = await dynamo.query(params);
    return result.Items;
  } catch (error) {
    console.error('DynamoDB Error:', error);
    throw new Error('Failed to fetch alarms');
  }
};

const createAlarm = async (userId, alarm) => {
  const params = {
    TableName: ALARMS_TABLE,
    Item: {
      userId,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      active: true,
      ...alarm
    }
  };

  try {
    await dynamo.put(params);
    return params.Item;
  } catch (error) {
    console.error('DynamoDB Error:', error);
    throw new Error('Failed to create alarm');
  }
};

const updateAlarm = async (userId, alarmId, updates) => {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.entries(updates).forEach(([key, value]) => {
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  });

  const params = {
    TableName: ALARMS_TABLE,
    Key: {
      userId,
      id: alarmId
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };

  try {
    const result = await dynamo.update(params);
    return result.Attributes;
  } catch (error) {
    console.error('DynamoDB Error:', error);
    throw new Error('Failed to update alarm');
  }
};

const getUser = async (userId) => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId
    }
  };

  try {
    const result = await dynamo.get(params);
    return result.Item;
  } catch (error) {
    console.error('DynamoDB Error:', error);
    throw new Error('Failed to fetch user');
  }
};

const updateUser = async (userId, updates) => {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.entries(updates).forEach(([key, value]) => {
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  });

  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };

  try {
    const result = await dynamo.update(params);
    return result.Attributes;
  } catch (error) {
    console.error('DynamoDB Error:', error);
    throw new Error('Failed to update user');
  }
};

const createUser = async (userId, userData) => {
  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId,
      createdAt: new Date().toISOString(),
      ...userData
    }
  };

  try {
    await dynamo.put(params);
    return params.Item;
  } catch (error) {
    console.error('DynamoDB Error:', error);
    throw new Error('Failed to create user');
  }
};

module.exports = {
  getAlarms,
  createAlarm,
  updateAlarm,
  getUser,
  updateUser,
  createUser
};
