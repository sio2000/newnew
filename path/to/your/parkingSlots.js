function addNewParkingSlot(location) {
    const newParkingSlot = {
        id: generateUniqueId(),
        location: location,
        timestamp: new Date().toISOString()
    };
    
    parkingSlots.unshift(newParkingSlot);
} 