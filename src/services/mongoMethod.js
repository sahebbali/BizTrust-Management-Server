/**
 * all method
 * @param getAll();
 * @param getDataByProperty();
 * @param updateDataByProperty();
 * @param deleteDataByProperty();
 * @param createData();
 * @returns 
 */
// get all data by condition
const getAll = async (key, value, Model) =>{
    return Model.find({[key]: value}).sort({createdAt: -1});
}
// get data by property
const getDataByProperty = async (key, value, Model, selectArray) =>{
    if(key === "_id"){
        return Model.findById(value);
    }
    return Model.findOne({[key]: value}).select(selectArray);
}

// update data by property
const updateDataByProperty = async (key, value, data, Model) =>{
    if(key === "_id"){
        return Model.findByIdAndUpdate({_id: value},{$set: {...data}},{new: true});
    }
    return Model.findOneAndUpdate({[key]: value}, {$set: {...data}},{new: true});
}

// delete data by property
const deleteDataByProperty = async (key, value, Model) => {
    if(key === "_id"){
        return Model.findByIdAndDelete({_id: value});
    }
    return Model.findOneAndDelete({[key]: value});
}

// create data
const createData = async (data, Model) =>{
    const newData = new Model(data);
    return newData.save();
}

module.exports = {getAll, getDataByProperty, updateDataByProperty, deleteDataByProperty, createData}