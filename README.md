# Fetch_Rewards
 It is assignment given by fetch rewards.  If you face any issue to run the code you can email on :- rdhoka98@gmail.com or call / message on - +17737572568

## Prerequisites
Make sure you have Node.js and npm installed on your machine.

Now to run the code locally please follow below steps :-
1. Clone the Repository:
git clone https://github.com/rdhoka97/Fetch_Rewards.git


2. Navigate to the Project Directory
for example :- Fetch_Rewards is the directory or folder name here

3. Install Dependencies:

npm install

4. Then start the server:- 
npm start 

5. Since i tested with postman follow below steps for postman :- 
  a. Go to postman then create a workspace then generate the id for the End point of Process Receipts :- 

  1. path :- Path:  http://localhost:3000/receipts/process
  2. Method: POST
  3. Payload: Receipt JSON
  4. Response: JSON containing an id for the receipt.

  I used this in the body inside it should be in raw and json as attached document in postman_outputs folder with screenshot named as generate_id as shown in screenshot put the json from the examples of questions readme file or attaching here for reference :-


  Example 1:- 
  {
  "retailer": "Target",
  "purchaseDate": "2022-01-01",
  "purchaseTime": "13:01",
  "items": [
    {
      "shortDescription": "Mountain Dew 12PK",
      "price": "6.49"
    },{
      "shortDescription": "Emils Cheese Pizza",
      "price": "12.25"
    },{
      "shortDescription": "Knorr Creamy Chicken",
      "price": "1.26"
    },{
      "shortDescription": "Doritos Nacho Cheese",
      "price": "3.35"
    },{
      "shortDescription": "   Klarbrunn 12-PK 12 FL OZ  ",
      "price": "12.00"
    }
  ],
  "total": "35.35"
}



Example 2:- 


{
  "retailer": "M&M Corner Market",
  "purchaseDate": "2022-03-20",
  "purchaseTime": "14:33",
  "items": [
    {
      "shortDescription": "Gatorade",
      "price": "2.25"
    },{
      "shortDescription": "Gatorade",
      "price": "2.25"
    },{
      "shortDescription": "Gatorade",
      "price": "2.25"
    },{
      "shortDescription": "Gatorade",
      "price": "2.25"
    }
  ],
  "total": "9.00"
}




Then once you generate id as attached screenshot as output_generate_id :- Now after you get id next step is to calculate points so follow the steps below 


1. Endpoint: Get Points
Path: /receipts/{id}/points  (replace id with actual id retrieved from post method for ex :- 2c64d506-f72a-4646-8d17-2cfd5fc61bfc)
Method: GET
Response: A JSON object containing the number of points awarded.

Also find the attached screenshot from the postman_outputs to see how exactly to get the output from get method screenshot will be named as :- get_method also you will see 2nd screenshot which will show you the results you should get once you click on send button which will be named as points_output.






