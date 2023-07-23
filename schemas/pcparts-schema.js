const mongoose = require('mongoose');

const pcPartSchema = new mongoose.Schema({
    _id: {type: Number, required: true},
    productName: {type: String, required: true},
    imageUrl: {type: String, required: true},
    price: {type: Number, required: true},
    quantity: {type: Number, required: true},
    name: String,
    manufacturer: String,
    moboId: Number,
    gpuId: Number,
    cpuId: Number,
    ramId: Number,
    psuId: Number,
    ssdId: Number,
    hddId: Number,
    coolerId: Number,
    caseId: Number,
    keyboardId: Number,
    headsetId: Number,
    type: String,
    socket: String,
    efficiency: String,
    mobo: String,
    gpu: String,
    cpu: String,
    ram: String,
    power: Number,
    cooling: String,
    memory: String,
    switch: String,
    wireless: Boolean
});

pcPartSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id; 
    }
})

const PcPart = mongoose.model('PcPart', pcPartSchema);
module.exports = PcPart;