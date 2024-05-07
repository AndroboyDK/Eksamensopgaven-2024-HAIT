// utils/api.schema.js
import joi from 'joi';
 
const schema = joi.object({
    intakeId: joi.number().required(),
    mealId: joi.number().allow(null),
    ingredientId: joi.number().required(),
    weightInGrams: joi.number().required(),
    totalKcal: joi.number().required(),
    totalProtein: joi.number().required(),
    totalFiber: joi.number().required(),
    totalFat: joi.number().required(),
    dateAndTimeOfIntake: joi.date().required(),
    lat: joi.number().required(),
    lon: joi.number().required(),
    cityName: joi.string().required()
});

export default schema;