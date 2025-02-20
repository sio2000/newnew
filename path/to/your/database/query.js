const parkingSlots = await ParkingSlot.find()
    .sort({ timestamp: -1 })
    .exec(); 