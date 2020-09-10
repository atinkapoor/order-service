const customer = require('../api/customer.js');
const AWS = require('aws-sdk'); 
const dynamoDb = new AWS.DynamoDB.DocumentClient();
//const validation = require('../api/validation.js');

const TEST_CUSTOMER_TABLE = 'customer-test';
const clearDb = async (data) => {
  await dynamoDb.delete({ TableName: TEST_CUSTOMER_TABLE, Key: { id: data.id } }, (err, res) => {
  });
};

describe('customer validation', () => {
    it('check validation once', async () => {
        const input = { fullname: "test1", email: "test1@test1.com" };
        const output = true;
        //const data = await validation(input);
        const data = await customer.validateRequest(input);
        expect(data).toEqual(output);
    });

    test.each`
        input | expectedResult
        ${{ fullname: "test1", email: "test1@test1.com" }} | ${true}
        ${{ fullname: "test2", email: "" }} | ${"\"email\" is not allowed to be empty"}
        ${{ fullname: "", email: "test3@test1.com" }} | ${"\"fullname\" is not allowed to be empty"}
        `('check validation of $input to $expectedResult', async ({ input, expectedResult }) => {
        expect(await customer.validateRequest(input)).toBe(expectedResult)
    })    
});

describe('customer data save in db', () => {
    beforeAll(() => {
      process.env.CUSTOMER_TABLE = TEST_CUSTOMER_TABLE;
    });
    afterAll(() => {
        process.env.CUSTOMER_TABLE = CUSTOMER_TABLE;
    });

    it('check data save', async () => {
        const input = { fullname: "test1", email: "test1@test1.com" };
        const data = await customer.submitCustomer(input);

        const {Item} = await dynamoDb.get({TableName: process.env.CUSTOMER_TABLE, Key: {id: data.id}}).promise();
        expect(Item).toEqual(input);
        clearDb(data);

        /*let params = {
            TableName: process.env.CUSTOMER_TABLE, 
            ProjectionExpression: "#email",
            FilterExpression: "#email = :email",
            ExpressionAttributeNames:{
                "#email": "email"
            },
            ExpressionAttributeValues: {
                ":email": input.email
            }
        };*/
        
        /*const {Item} = await dynamoDb.scan(params, function(err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            } else {
                console.log("Query succeeded.");
                return data.Items[0].email;
                data.Items.forEach(function(item) {
                    console.log(" -", item.year + ": " + item.title);
                });
                //expect(output).toEqual(input.email);
            }
        }).promise();*/
        
    });
});

