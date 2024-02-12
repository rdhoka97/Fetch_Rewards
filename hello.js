const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;
const Ajv = require('ajv');
const ajv = new Ajv();
// In-memory storage for receipts and points
const receipts = {};
const receiptSchema = require('./schemas/receiptSchema.json');
app.use(bodyParser.json());

app.post('/receipts/process', (req, res) => {
    try {
        const receiptData = req.body;

        // Validate the receipt against the schema
        validateReceipt(receiptData);

        // Generate a unique ID for the receipt
        const receiptId = generateReceiptId();

        // Store the receipt in memory
        receipts[receiptId] = receiptData;

        res.status(200).json({ id: receiptId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/receipts/:receiptId/points', (req, res) => {
    const { receiptId } = req.params;

    if (receiptId in receipts) {
        // Calculate points based on the specified rules
        const points = calculatePoints(receipts[receiptId]);
        res.status(200).json({ points });
    } else {
        res.status(404).json({ error: 'No receipt found for that id' });
    }
});


function validateReceipt(receipt) {
    const validate = ajv.compile(receiptSchema);
    const isValid = validate(receipt);

    if (!isValid) {
        const errors = validate.errors.map(error => {
            return {
                path: error.dataPath,
                message: error.message,
            };
        });

        throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
    }
}

function generateReceiptId() {
    return uuidv4();
}

function calculatePoints(receipt) {
    let points = 0;
    let breakdown = [];

    // Rule 1: One point for every alphanumeric character in the retailer name
    const alphanumericCount = calculatePointsForAlphanumeric(receipt.retailer);
    points += alphanumericCount;
    breakdown.push(`${alphanumericCount} points - retailer name has ${alphanumericCount} alphanumeric characters`);

    // Rule 2: 50 points if the total is a round dollar amount with no cents
    if (receipt.total.endsWith('.00')) {
        points += 50;
        breakdown.push(`50 points - total is a round dollar amount`);
    }

    // Rule 3: 25 points if the total is a multiple of 0.25
    const totalAsFloat = parseFloat(receipt.total);
    if (totalAsFloat % 0.25 === 0) {
        points += 25;
        breakdown.push(`25 points - total is a multiple of 0.25`);
    }

    // Rule 4: 5 points for every two items on the receipt
    const itemsPoints = calculatePointsForItems(receipt.items);
    points += itemsPoints;
    breakdown.push(`${itemsPoints} points - ${receipt.items.length} items (${itemsPoints} pairs @ 5 points each)`);

    // Rule 5: If the trimmed length of the item description is a multiple of 3,
    // multiply the price by 0.2 and round up to the nearest integer.
    // The result is the number of points earned.
    receipt.items.forEach((item) => {
        const trimmedLength = item.shortDescription.trim().length;
        if (trimmedLength % 3 === 0) {
            const itemPoints = Math.ceil(parseFloat(item.price) * 0.2);
            points += itemPoints;
            breakdown.push(`${itemPoints} points - "${item.shortDescription}" is ${trimmedLength} characters (a multiple of 3)`);
        }
    });

    // Rule 6: 6 points if the day in the purchase date is odd
    const purchaseDate = new Date(receipt.purchaseDate);
    const dayOfMonth = parseInt(receipt.purchaseDate.split('-')[2]); // Extract day from date string

    console.log("Purchase Date:", receipt.purchaseDate);
    console.log("Day of Month:", dayOfMonth);

    if (dayOfMonth % 2 === 1) {
        points += 6;
        breakdown.push(`6 points - purchase day is odd`);
    }



    // Rule 7: 10 points if the time of purchase is after 2:00pm and before 4:00pm
    const purchaseTime = new Date(`1970-01-01 ${receipt.purchaseTime}`);
    if (purchaseTime > new Date('1970-01-01 14:00') && purchaseTime < new Date('1970-01-01 16:00')) {
        points += 10;
        breakdown.push(`10 points - ${receipt.purchaseTime} is between 2:00pm and 4:00pm`);
    }

    return { points, breakdown };
}



function generateBreakdown(receipt, totalPoints) {
    const breakdown = [
        `${totalPoints} points - total is a round dollar amount`,
        `${totalPoints} points - total is a multiple of 0.25`,
        `${calculatePointsForAlphanumeric(receipt.retailer)} points - retailer name has ${calculatePointsForAlphanumeric(receipt.retailer)} alphanumeric characters`,
        `${calculatePointsForPurchaseTime(receipt.purchaseTime)} points - ${receipt.purchaseTime} is between 2:00pm and 4:00pm`,
        `${calculatePointsForItems(receipt.items)} points - ${receipt.items.length} items (${calculatePointsForItems(receipt.items)} pairs @ 5 points each)`
    ];

    const totalBreakdownPoints = breakdown.reduce((acc, breakdownItem) => {
        const pointsMatch = breakdownItem.match(/(\d+) points/);
        return acc + (pointsMatch ? parseInt(pointsMatch[1]) : 0);
    }, 0);

    breakdown.push(`+ ---------`);
    breakdown.push(`= ${totalBreakdownPoints} points`);

    return breakdown;
}

function calculatePointsForAlphanumeric(str) {
    return str.replace(/[^a-zA-Z0-9]/g, '').length;
}

function calculatePointsForPurchaseTime(purchaseTime) {
    const time = new Date(`1970-01-01 ${purchaseTime}`);
    if (time > new Date('1970-01-01 14:00') && time < new Date('1970-01-01 16:00')) {
        return 10;
    }
    return 0;
}

function calculatePointsForItems(items) {
    return Math.floor(items.length / 2) * 5;
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
