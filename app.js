const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Read availability information from JSON file
const availabilityData = JSON.parse(fs.readFileSync('availability.json', 'utf8'));

// Function to check if a given time falls within a given slot
const isTimeInRange = (time, start, end) => {
    const [hour, minute] = time.split(':').map(Number);
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    const requestedTime = hour * 60 + minute;
    const slotStartTime = startHour * 60 + startMinute;
    const slotEndTime = endHour * 60 + endMinute;

    return requestedTime >= slotStartTime && requestedTime <= slotEndTime;
};

const check = (requestedDate, requestedTime, availability) => {
    const requestedDay = new Date(requestedDate).getDay();
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayAvailability = availability[weekdays[requestedDay]];
    
    // Find the next available slot after the requested time
    for (const slot of dayAvailability) {
        if (isTimeInRange(requestedTime, slot.start, slot.end)) {
            // Doctor is available at requested time
            return true;
        }
    }

    return false;
}

// Function to find the next available slot for a given day
const findNextAvailableSlot = (requestedDate, requestedTime, availability) => {
    const requestedDay = new Date(requestedDate).getDay();
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayAvailability = availability[weekdays[requestedDay]];
    
    if (dayAvailability.length === 0) {
        // Doctor is on leave for the requested day
        return null;
    }
    
    // Find the next available slot after the requested time
    for (const slot of dayAvailability) {
        if (isTimeInRange(requestedTime, slot.start, slot.end)) {
            // Doctor is available at requested time
            return true;
        }
    }

    if(requestedDay === 6 ||  requestedDay === 0){
        return availability['monday'[0]]
    }
    else{
        nextday = requestedDay+1;
        // console.log(availability[weekdays[nextday]])
        return availability[weekdays[nextday]]
    }
};


// Endpoint for doctor availability
app.get('/doctor-availability', (req, res) => {
    const { date, time } = req.query;
    const checkavailable = check(date, time, availabilityData.availabilityTimings);
    if (!checkavailable) {
        const nextAvailableSlot = findNextAvailableSlot(date, time, availabilityData.availabilityTimings);
        res.json({
            isAvailable: false,
            nextAvailableSlot: nextAvailableSlot
        })
    }
    else{
        res.json({
            isAvailable: true
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
