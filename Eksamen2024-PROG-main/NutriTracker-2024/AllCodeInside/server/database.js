import sql from 'mssql';

export class Database {
  config = {};
  poolconnection = null;
  connected = false;

  constructor(config) {
    this.config = config;
    /* console.log(`Database: config: ${JSON.stringify(config)}`); */
  }

  async connect() {
    try {
      /* console.log(`Database connecting...${this.connected}`); */
      /* console.log(this.config) */
      if (this.connected === false) {
        this.poolconnection = await sql.connect(this.config);
        this.connected = true;
        /* console.log('Database connection successful'); */
      } else {
        /* console.log('Database already connected'); */
      }
    } catch (error) {
      /* console.error(`Error connecting to database: ${JSON.stringify(error)}`); */
      console.log(error)
    }
  }

  async disconnect() {
    try {
      this.poolconnection.close();
      /* console.log('Database connection closed'); */
    } catch (error) {
      /* console.error(`Error closing database connection: ${error}`); */
    }
  }

  async executeQuery(query) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(query);

    return result.rowsAffected[0];
  }

  // user methods
  async createUser(data) {
    await this.connect();
    const request = this.poolconnection.request();

    request.input('email', sql.VarChar(255), data.email);
    request.input('pwd', sql.VarChar(255), data.pwd);
    request.input('name', sql.VarChar(255), data.uName);
    request.input('weight', sql.Float, data.weight);
    request.input('dateOfBirth', sql.Date, data.dateOfBirth);
    request.input('gender', sql.Char(1), data.gender);

    const result = await request.query(
      `INSERT INTO eksamen.userr (email, pwd, name, weight, dateOfBirth, gender) 
      VALUES (@email, @pwd, @name, @weight, @dateOfBirth, @gender)`
    );

    return result.rowsAffected[0];
  }

  async readUser(email) {
    await this.connect();

    const request = this.poolconnection.request();
    const result = await request
      .input('email', sql.VarChar(255), email)
      .query(`SELECT * 
      FROM eksamen.userr 
      WHERE email = @email`
      );

    return result.recordset[0];
  }
  async readUserNameById(userId) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .input('userId', sql.Int, userId)
      .query(`
      SELECT name 
      FROM eksamen.userr 
      WHERE userId = @userId
      `
      );
    return result.recordset[0];
  }

  async updateUser(id, data) {
    await this.connect();

    // first we get the information from the user to check
    const requestUser = this.poolconnection.request();
    const resultUser = await requestUser
      .input('userId', sql.Int, id)
      .query(`SELECT * 
      FROM eksamen.userr 
      WHERE userId = @userId`
      );

    const userData = resultUser.recordset[0];

    let resultAll = 0;

    // then we update the user
    if (data.email !== userData.email && data.email !== '') {
      
      const request = this.poolconnection.request();
      const result = await request
        .input('userId', sql.Int, id)
        .input('email', sql.VarChar(255), data.email)
        .query(`UPDATE 
        eksamen.userr 
        SET email=@email 
        WHERE userId = @userId`
        );
      
      resultAll += result.rowsAffected[0];
    }
    if (data.pwd !== '') {

      const request = this.poolconnection.request();
      const result = await request
        .input('userId', sql.Int, id)
        .input('pwd', sql.VarChar(255), data.pwd)
        .query(`UPDATE 
        eksamen.userr 
        SET pwd=@pwd 
        WHERE userId = @userId`
        );

      resultAll += result.rowsAffected[0];
    }
    if (data.uName !== userData.uName && data.uName !== '') {
      
      const request = this.poolconnection.request();
      const result = await request
        .input('userId', sql.Int, id)
        .input('name', sql.VarChar(255), data.uName)
        .query(`UPDATE eksamen.userr 
        SET name=@name 
        WHERE userId = @userId`
        );

      resultAll += result.rowsAffected[0];
    }
    if (data.weight !== userData.weight && data.weight !== '') {
      
      const request = this.poolconnection.request();
      const result = await request
        .input('userId', sql.Int, id)
        .input('weight', sql.Float, data.weight)
        .query(`UPDATE eksamen.userr 
        SET weight=@weight 
        WHERE userId = @userId`
        );
 
      resultAll += result.rowsAffected[0];
    }
    if (data.dateOfBirth !== userData.dateOfBirth && data.dateOfBirth !== '') {
      
      const request = this.poolconnection.request();
      const result = await request
        .input('userId', sql.Int, id)
        .input('dateOfBirth', sql.Date, data.dateOfBirth)
        .query(`UPDATE eksamen.userr 
        SET dateOfBirth=@dateOfBirth 
        WHERE userId = @userId`
        );
      
      resultAll += result.rowsAffected[0];
    }
    if (data.gender !== userData.gender && data.gender !== '') {
      
      const request = this.poolconnection.request();
      const result = await request
        .input('userId', sql.Int, id)
        .input('gender', sql.Char(1), data.gender)
        .query(`UPDATE eksamen.userr 
        SET gender=@gender 
        WHERE userId = @userId`
        );
      
      resultAll += result.rowsAffected[0];
    }

    return resultAll;

  }

  async deleteUser(id) {
    await this.connect();

    const request = this.poolconnection.request();
    const result = await request
      .input('userId', sql.Int, id)
      .query(`DELETE 
      FROM eksamen.userr 
      WHERE userId = @userId`
      );

    return result.rowsAffected[0];
  }

  // bsls methods
  async readBsls(age, gender) {
    await this.connect();

    const request = this.poolconnection.request();
    const result = await request
      .input('age', sql.Int, age)
      .input('gender', sql.Char(1), gender)
      .query(`
      SELECT * 
      FROM eksamen.bslsUdregning 
      WHERE age = @age AND gender = @gender`);
    
    return result.recordset[0];
  }

  async updateUserBsls(id, bsls) {
    await this.connect();

    const request = this.poolconnection.request();

    request
      .input('userId', sql.Int, id)
      .input('bslsskifte24hr', sql.Float, bsls);

    const result = await request.query(
      `UPDATE eksamen.userr 
      SET bslsskifte24hr=@bslsskifte24hr 
      WHERE userId = @userId`
    );

    return result.rowsAffected[0];
  }
  // daily methods
  async readDailyDay(userId) {
    await this.connect();

    /* const requestObject = {}; */
    const request = this.poolconnection.request();

    request
      .input('userId', sql.Int, userId);


    // all in one query
    const allInOne = await request.query(`
      WITH Hours AS (
        SELECT 0 AS Hour
        UNION ALL
        SELECT Hour + 1
        FROM Hours
        WHERE Hour < 23
    ),
      UserBslsskifte AS (
        SELECT (SELECT bslsskifte24hr FROM eksamen.userr WHERE userId = @userId) * 239 / 24.0 AS Bslsskifte24hr
    )
    SELECT Hours.Hour,
          COALESCE(SUM(subquery.TotalEnergy), 0) AS TotalEnergy,
          COALESCE(SUM(subquery.TotalWater), 0) AS TotalWater,
          COALESCE(SUM(subquery.TotalBurned), 0) + UserBslsskifte.Bslsskifte24hr AS TotalBurned
    FROM Hours
    CROSS JOIN UserBslsskifte
    LEFT JOIN
    (
        SELECT DATEPART(hour, intake.dateAndTimeOfIntake) AS Hour,
              SUM(totalKcal) AS TotalEnergy,
              NULL AS TotalWater,
              NULL AS TotalBurned
        FROM eksamen.intake
        WHERE intake.userId = @userId
          AND intake.dateAndTimeOfIntake >= DATEADD(day, -1, GETDATE())
        GROUP BY DATEPART(hour, intake.dateAndTimeOfIntake)
        UNION ALL
        SELECT DATEPART(hour, waterRegistration.dateAndTimeOfDrinking) AS Hour,
              NULL AS TotalEnergy,
              SUM(waterRegistration.amountOfWater) AS TotalWater,
              NULL AS TotalBurned
        FROM eksamen.waterRegistration
        WHERE waterRegistration.userId = @userId
          AND waterRegistration.dateAndTimeOfDrinking >= DATEADD(day, -1, GETDATE())
        GROUP BY DATEPART(hour, waterRegistration.dateAndTimeOfDrinking)
        UNION ALL
        SELECT DATEPART(hour, dateAndTimeOfActivity) AS Hour,
              NULL AS TotalEnergy,
              NULL AS TotalWater,
              SUM(burnedKcal) AS TotalBurned
        FROM eksamen.user_activities
        WHERE userId = @userId AND dateAndTimeOfActivity >= DATEADD(day, -1, GETDATE())
        GROUP BY DATEPART(hour, dateAndTimeOfActivity)
    ) AS subquery
    ON Hours.Hour = subquery.Hour
    GROUP BY Hours.Hour, UserBslsskifte.Bslsskifte24hr
    ORDER BY Hours.Hour;`);

    return allInOne.recordset;

  };

  async readDailyMonth(userId) {
    await this.connect();

    /* const requestObject = {}; */
    const request = this.poolconnection.request();

    request
      .input('userId', sql.Int, userId);

    // all in one query
    const allInOne = await request.query(`
      WITH Days AS (
        SELECT CAST(GETDATE() - 30 AS DATE) AS Day
        UNION ALL
        SELECT DATEADD(dd, 1, Day)
        FROM Days
        WHERE Day < CAST(GETDATE() AS DATE)
      ),
      UserBslsskifte AS (
        SELECT (SELECT bslsskifte24hr FROM eksamen.userr WHERE userId = @userId) * 239 AS Bslsskifte24hr
      )
      SELECT Days.Day,
         COALESCE(SUM(subquery.TotalEnergy), 0) AS TotalEnergy,
         COALESCE(SUM(subquery.TotalWater), 0) AS TotalWater,
         COALESCE(SUM(subquery.TotalBurned), 0) + UserBslsskifte.Bslsskifte24hr AS TotalBurned
      FROM Days
      CROSS JOIN UserBslsskifte
      LEFT JOIN
      (
        SELECT CAST(dateAndTimeOfIntake AS DATE) AS Day,
             SUM(totalKcal) AS TotalEnergy,
             NULL AS TotalWater,
             NULL AS TotalBurned
        FROM eksamen.intake
        WHERE intake.userId = @userId
          AND intake.dateAndTimeOfIntake >= DATEADD(day, -30, GETDATE())
        GROUP BY CAST(dateAndTimeOfIntake AS DATE)
        UNION ALL
        SELECT CAST(dateAndTimeOfDrinking AS DATE) AS Day,
             NULL AS TotalEnergy,
             SUM(waterRegistration.amountOfWater) AS TotalWater,
             NULL AS TotalBurned
        FROM eksamen.waterRegistration
        WHERE waterRegistration.userId = @userId
          AND waterRegistration.dateAndTimeOfDrinking >= DATEADD(day, -30, GETDATE())
        GROUP BY CAST(dateAndTimeOfDrinking AS DATE)
        UNION ALL
        SELECT CAST(dateAndTimeOfActivity AS DATE) AS Day,
             NULL AS TotalEnergy,
             NULL AS TotalWater,
             SUM(burnedKcal) AS TotalBurned
        FROM eksamen.user_activities
        WHERE userId = @userId AND dateAndTimeOfActivity >= DATEADD(day, -30, GETDATE())
        GROUP BY CAST(dateAndTimeOfActivity AS DATE)
      ) AS subquery
      ON Days.Day = subquery.Day
      GROUP BY Days.Day, UserBslsskifte.Bslsskifte24hr
      ORDER BY Days.Day;
    `);

    return allInOne.recordset;
  };

  // intake methods
  async readAllMealsAsIntakes(userId) {
    await this.connect();

    const request = this.poolconnection.request();

    const result = await request
      .input('userId', sql.Int, +userId)
      .query(`
      SELECT  intake.intakeId, intake.mealId, meal.mealName, ingredientId, weightInGrams, totalKcal, totalProtein, totalFiber, totalFat, dateAndTimeOfIntake, lat, lon, cityName
      FROM eksamen.intake
      JOIN eksamen.intake_location ON eksamen.intake.intakeId = eksamen.intake_location.intakeId
      JOIN eksamen.meal ON eksamen.intake.mealId = eksamen.meal.mealId
      WHERE userId = @userId AND ingredientId IS NULL
      `);


    return result.recordsets[0];
  }
  async readAllIngridsAsIntakes(userId) {
    await this.connect();

    const request = this.poolconnection.request();

    const result = await request
      .input('userId', sql.Int, +userId)
      .query(`
      SELECT  intake.intakeId, ingredients.ingredientName, intake.ingredientId, weightInGrams, totalKcal, totalProtein, totalFiber, totalFat, dateAndTimeOfIntake, lat, lon, cityName
      FROM eksamen.intake
      JOIN eksamen.intake_location ON eksamen.intake.intakeId = eksamen.intake_location.intakeId
      JOIN eksamen.ingredients ON eksamen.intake.ingredientId = eksamen.ingredients.ingredientId
      WHERE userId = @userId AND mealId IS NULL
      `);


    return result.recordsets[0];

  };

  async createIntake(data) {
    await this.connect();

    const request = this.poolconnection.request();
    request.input('userId', sql.Int, data.userId);
    request.input('mealId', sql.Int, data.mealId);
    request.input('ingredientId', sql.Int, data.ingredientId);
    request.input('weightInGrams', sql.Float, data.weightInGrams);
    request.input('dateAndTimeOfIntake', sql.DateTime, data.dateAndTimeOfIntake);

    const result = await request.query(`
      INSERT INTO eksamen.intake (userId, mealId, ingredientId, weightInGrams, totalKcal, totalProtein, totalFiber, totalFat, dateAndTimeOfIntake)
      VALUES (@userId, @mealId, @ingredientId, @weightInGrams, ((SELECT kcal100g FROM eksamen.meal WHERE mealId = @mealId)* (@weightInGrams / 100)), ((SELECT protein100g FROM eksamen.meal WHERE mealId = @mealId)* (@weightInGrams / 100)), ((SELECT fiber100g FROM eksamen.meal WHERE mealId = @mealId)* (@weightInGrams / 100)), ((SELECT fat100g FROM eksamen.meal WHERE mealId = @mealId)* (@weightInGrams / 100)), @dateAndTimeOfIntake);
      SELECT SCOPE_IDENTITY() AS intakeId;
    `);
    return result.recordset[0].intakeId;
  }

  createIntakeWithIngredient = async (data) => {
    await this.connect();

    const request = this.poolconnection.request();

    request.input('userId', sql.Int, data.userId);
    request.input('mealId', sql.Int, data.mealId);
    request.input('ingredientId', sql.Int, data.ingredientId);
    request.input('weightInGrams', sql.Float, data.weightInGrams);
    request.input('dateAndTimeOfIntake', sql.DateTime, data.dateAndTimeOfIntake);

    const result = await request.query(`
      INSERT INTO eksamen.intake (userId, mealId, ingredientId, weightInGrams, totalKcal, totalProtein, totalFiber, totalFat, dateAndTimeOfIntake)
      VALUES (@userId, @mealId, @ingredientId, @weightInGrams, ((SELECT kcal100g FROM eksamen.ingredients WHERE ingredientId = @ingredientId)* (@weightInGrams / 100)), ((SELECT protein100g FROM eksamen.ingredients WHERE ingredientId = @ingredientId)* (@weightInGrams / 100)), ((SELECT fiber100g FROM eksamen.ingredients WHERE ingredientId = @ingredientId)* (@weightInGrams / 100)), ((SELECT fat100g FROM eksamen.ingredients WHERE ingredientId = @ingredientId)* (@weightInGrams / 100)), @dateAndTimeOfIntake);
      
      SELECT SCOPE_IDENTITY() AS intakeId;
    `);

    return result.recordset[0].intakeId;
  }

  async createIntakeLocation(data) {
    await this.connect();

    const request = this.poolconnection.request();

    request.input('intakeId', sql.Int, data.intakeId);
    request.input('lat', sql.Float, data.lat);
    request.input('lon', sql.Float, data.lon);
    request.input('cityName', sql.VarChar, data.cityName);

    const result = await request.query(`
        INSERT INTO eksamen.intake_location (intakeId, lat, lon, cityName)
        VALUES (@intakeId, @lat, @lon, @cityName);
    `);

    return result.rowsAffected[0];
  }

  async updateIntake(id, data) {
    await this.connect();

    const request = this.poolconnection.request();

    request.input('id', sql.Int, id);
    request.input('weightInGrams', sql.Float, data.weightInGrams);
    request.input('dateAndTimeOfIntake', sql.DateTime, data.dateAndTimeOfIntake);

    const result = await request.query(`
      DECLARE @mealId INT;
      SELECT @mealId = mealId FROM eksamen.intake WHERE intakeId = @id;

      UPDATE eksamen.intake
      SET weightInGrams = @weightInGrams,
      dateAndTimeOfIntake = @dateAndTimeOfIntake
      WHERE intakeId = @id;

      UPDATE eksamen.intake
      SET totalKcal = ((SELECT kcal100g FROM eksamen.meal WHERE mealId = @mealId) * (@weightInGrams / 100)),
      totalProtein = ((SELECT protein100g FROM eksamen.meal WHERE mealId = @mealId)* (@weightInGrams / 100)),
      totalFiber = ((SELECT fiber100g FROM eksamen.meal WHERE mealId = @mealId)* (@weightInGrams / 100)),
      totalFat = ((SELECT fat100g FROM eksamen.meal WHERE mealId = @mealId)* (@weightInGrams / 100))
      WHERE intakeId = @id;
    `);

    return result.rowsAffected[0];
  }
  updateIngridIntake = async (id, data) => {
    await this.connect();

    const request = this.poolconnection.request();

    request.input('id', sql.Int, id);
    request.input('weightInGrams', sql.Float, data.weightInGrams);
    request.input('dateAndTimeOfIntake', sql.DateTime, data.dateAndTimeOfIntake);

    const result = await request.query(`
      DECLARE @ingredientId INT;
      SELECT @ingredientId = ingredientId FROM eksamen.intake WHERE intakeId = @id;

      UPDATE eksamen.intake
      SET weightInGrams = @weightInGrams,
      dateAndTimeOfIntake = @dateAndTimeOfIntake
      WHERE intakeId = @id;

      UPDATE eksamen.intake
      SET totalKcal = ((SELECT kcal100g FROM eksamen.ingredients WHERE ingredientId = @ingredientId) * (@weightInGrams / 100)),
      totalProtein = ((SELECT protein100g FROM eksamen.ingredients WHERE ingredientId = @ingredientId)* (@weightInGrams / 100)),
      totalFiber = ((SELECT fiber100g FROM eksamen.ingredients WHERE ingredientId = @ingredientId)* (@weightInGrams / 100)),
      totalFat = ((SELECT fat100g FROM eksamen.ingredients WHERE ingredientId = @ingredientId)* (@weightInGrams / 100))
      WHERE intakeId = @id;
    `);

    return result.rowsAffected[0];
  };

  async deleteIntakeAndIntakeLocation(id) {
    await this.connect();

    const idAsNumber = Number(id);

    const request = this.poolconnection.request();

    const result = await request
      .input('id', sql.Int, idAsNumber)
      .query(`
      DELETE FROM eksamen.intake_location WHERE intakeId = @id
      DELETE FROM eksamen.intake WHERE intakeId = @id
      `);


    return result.rowsAffected[0];
  }

  async deleteAllIntakesAndIntakeLocations(userId) {

    await this.connect();

    const request = this.poolconnection.request();

    const result = await request
      .input('userId', sql.Int, userId)
      .query(`
      DELETE FROM eksamen.intake_location WHERE intakeId IN (SELECT intakeId FROM eksamen.intake WHERE userId = @userId)
      DELETE FROM eksamen.intake WHERE userId = @userId
      `);

    return result.rowsAffected[0];
  }

  // water intake methods
  async createWaterIntake(data) {
    //Laver en connection til databasen
    /* console.log(data); */
    await this.connect();
    //Laver en request til databasen
    const request = this.poolconnection.request();
    //Indsætter data fra req.body til databasen
    request.input('userId', sql.Int, data.userId);
    //Det det står i sådan et input felt er først hvad det skal hedde i databasen, så hvad det er for en type og så hvad det er for en værdi
    request.input('amountOfWater', sql.Int, data.amountOfWater);
    request.input('dateAndTimeOfDrinking', sql.DateTime, data.dateAndTimeOfDrinking);
    request.input('lat', sql.Float, data.lat)
    request.input('lon', sql.Float, data.lon)
    request.input('city', sql.VarChar, data.city)

    //Her indsætter jeg dataen i databasen ved at bruge en query
    const result = await request.query(`
      INSERT INTO eksamen.waterRegistration (userId, amountOfWater, dateAndTimeOfDrinking, lat, lon, city)
      VALUES (@userId, @amountOfWater, @dateAndTimeOfDrinking, @lat, @lon, @city);
    `);

    return result.rowsAffected[0];
  }

  async readWaterIntakes(userId) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .input('userId', sql.Int, userId)
      .query(`
      SELECT * FROM eksamen.waterRegistration WHERE userId = @userId;
    `);

    return result.recordsets[0];
  }

  async updateWaterIntake(waterRegId, data) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('waterRegId', sql.Int, waterRegId);
    request.input('amountOfWater', sql.Float, data.amountOfWater);
    request.input('dateAndTimeOfDrinking', sql.DateTime, data.dateAndTimeOfDrinking);
    const result = await request.query(`
      UPDATE eksamen.waterRegistration
      SET
        amountOfWater = @amountOfWater,
        dateAndTimeOfDrinking = @dateAndTimeOfDrinking
      WHERE waterRegId = @waterRegId;
    `);

    return result.rowsAffected[0];
  }

  async deleteWaterIntake(waterRegId) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .input('waterRegId', sql.Int, waterRegId)
      .query(`
      DELETE FROM eksamen.waterRegistration WHERE waterRegId = @waterRegId;
    `);

    return result.rowsAffected[0];
  }
  async deleteWaterIntakesForAUser(userId) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .input('userId', sql.Int, userId)
      .query(`
      DELETE FROM eksamen.waterRegistration WHERE userId = @userId;
    `);

    return result.rowsAffected[0];
  }

  // ingredient methods
  async searchIngridient(ingredientName) {
    await this.connect();

    const request = this.poolconnection.request();
    const result = await request

      .input('ingredientName', sql.VarChar(25), '%' + ingredientName + '%')
      .query(`
		   SELECT TOP 5 * 
       FROM eksamen.ingredients 
	     WHERE ingredientName LIKE @ingredientName`
      );
    return result.recordsets[0];
  }
  async readIngredientById(ingredientId) {
    await this.connect();

    const request = this.poolconnection.request();
    const result = await request
      .input('ingredientId', sql.Int, ingredientId)
      .query(`
      SELECT * 
      FROM eksamen.ingredients 
      WHERE ingredientId = @ingredientId;
    `);
    return result.recordsets[0];

  }

  // meal methods
  async createMeal(data) {

    await this.connect();
    const request = this.poolconnection.request();

    request.input('mealName', sql.NVarChar, data.mealName);
    request.input('createdOn', sql.DateTime, data.createdOn);
    request.input('createdByUserId', sql.Int, data.createdByUserId);
    request.input('kcal100g', sql.Float, data.kcal100g);
    request.input('protein100g', sql.Float, data.protein100g);
    request.input('fiber100g', sql.Float, data.fiber100g);
    request.input('fat100g', sql.Float, data.fat100g);

    const result = await request.query(`
      INSERT INTO eksamen.meal (mealName, createdOn, createdByUserId, kcal100g, protein100g, fiber100g, fat100g)
      VALUES (@mealName, @createdOn, @createdByUserId, @kcal100g, @protein100g, @fiber100g, @fat100g);

      SELECT SCOPE_IDENTITY() AS mealId;
    `);
    return result.recordset[0].mealId;
  }
  async readAllIngridForMeal(mealId) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .input('mealId', sql.Int, mealId)
      .query(`
      SELECT eksamen.ingredients.ingredientName, eksamen.meal_ingredients.gramsOfIngredient
      FROM eksamen.meal_ingredients
      join eksamen.ingredients
      on eksamen.meal_ingredients.ingredientId = eksamen.ingredients.ingredientId
      WHERE mealId = @mealId;

    `);
    return result.recordset;
  }

  async createMealIngredients(data) {
    await this.connect();
    const request = this.poolconnection.request();

    request.input('mealId', sql.Int, data.mealId);
    request.input('ingredientId', sql.Int, data.ingredientId);
    request.input('gramsOfIngredient', sql.Float, data.gramsOfIngredient);

    const result = await request.query(`
      INSERT INTO eksamen.meal_ingredients (mealId, ingredientId, gramsOfIngredient)
      VALUES (@mealId, @ingredientId, @gramsOfIngredient);
    `);
    return result.rowsAffected[0];
  }
  async updateMealMacros(mealId) { //This function will run through the meal_ingredients table and calculate the total macros for the meal - it uses subqueries to get the macros for each ingredient and then sums them up
    await this.connect();
    const request = this.poolconnection.request();

    request.input('mealId', sql.Int, mealId);

    const result = await request.query(`
    UPDATE eksamen.meal
    SET
    kcal100g =
    (SELECT SUM(gramsOfIngredient * eksamen.ingredients.Kcal100g / 100)
    FROM eksamen.meal_ingredients
    JOIN eksamen.ingredients
    ON eksamen.meal_ingredients.ingredientId = eksamen.ingredients.ingredientId
    WHERE mealId = @mealId
    ),
    protein100g =
    (SELECT SUM(gramsOfIngredient * eksamen.ingredients.protein100g / 100)
    FROM eksamen.meal_ingredients
    JOIN eksamen.ingredients
    ON eksamen.meal_ingredients.ingredientId = eksamen.ingredients.ingredientId
    WHERE mealId = @mealId
    ),
    fiber100g =
    (SELECT SUM(gramsOfIngredient * eksamen.ingredients.fiber100g / 100)
    FROM eksamen.meal_ingredients JOIN eksamen.ingredients
    ON eksamen.meal_ingredients.ingredientId = eksamen.ingredients.ingredientId
    WHERE mealId = @mealId
    ),
    fat100g =
    (SELECT SUM(gramsOfIngredient * eksamen.ingredients.fat100g / 100)
    FROM eksamen.meal_ingredients
    JOIN eksamen.ingredients
    ON eksamen.meal_ingredients.ingredientId = eksamen.ingredients.ingredientId
    WHERE mealId = @mealId)
    WHERE mealId = @mealId;
    `);
    return result.rowsAffected[0];
  }

  /*  
  THIS WONT BE USED AND IS THERFORE COMMENTED OUT. 
  async readMeal(mealId) {
     await this.connect();
     const request = this.poolconnection.request();
     const result = await request
       .input('mealId', sql.Int, mealId)
       .query(`
       SELECT * 
       FROM eksamen.meal 
       WHERE mealId = @mealId;
     `);
   } */
  async countIngridsForMeal(mealId) {
    await this.connect();
    const request = this.poolconnection.request();

    const result = await request
      .input('mealId', sql.Int, mealId)
      .query(`
      SELECT COUNT(ingredientId) AS numberOfIngrids
      FROM eksamen.meal_ingredients
      WHERE mealId = @mealId;
    `);
    return result.recordset[0];
  }

  async readAllMealsForUser(userId) { //Gives all meals in desc order with createdOn
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .input('userId', sql.Int, userId)
      .query(`
      SELECT *
      FROM eksamen.meal
      WHERE createdByUserId = @userId
      ORDER BY createdOn ASC;
    `);
    return result.recordset;
  }

  async countTimesEaten(mealId) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .input('mealId', sql.Int, mealId)
      .query(`
      SELECT COUNT(mealId) AS timesEaten
      FROM eksamen.intake
      WHERE mealId = @mealId;
    `);
    return result.recordset[0];
  }

  async updateMeal(mealId, data) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('mealId', sql.Int, mealId);
    request.input('mealName', sql.NVarChar, data.mealName);
    request.input('createdOn', sql.DateTime, data.createdOn);
    request.input('kcal100g', sql.Float, data.kcal100g);
    request.input('protein100g', sql.Float, data.protein100g);
    request.input('fiber100g', sql.Float, data.fiber100g);
    request.input('fat100g', sql.Float, data.fat100g);

    const result = await request.query(`
      UPDATE eksamen.meal
      
      SET mealName = @mealName,
          createdOn = @createdOn,
          kcal100g = @kcal100g,
          protein100g = @protein100g,
          fiber100g = @fiber100g,
          fat100g = @fat100g

      WHERE mealId = @mealId;
    `);
    return result.rowsAffected[0];
  }

  async deleteMealAndIngrids(mealId) { //Modified because we now have cascading delete on meal_ingredients
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .input('mealId', sql.Int, mealId)
      .query(`
      DELETE 
      FROM eksamen.meal 
      WHERE mealId = @mealId;
    `);

    return result.rowsAffected[0];
  }

  async deleteAllMealsAndItsIngridientsForUser(userId) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .input('userId', sql.Int, userId)
      .query(`
      DELETE 
      FROM eksamen.meal 
      WHERE createdByUserId = @userId;
    `);

    return result.rowsAffected[0];
  };

  // activity methods (read)
  async readActivities() {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .query(`
      SELECT * 
      FROM eksamen.activity
    `);

    return result.recordset;
  }
  async readActivity(activityId) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .input('activityId', sql.Int, activityId)
      .query(`
      SELECT * 
      FROM eksamen.activity 
      WHERE activityId = @activityId;
    `);
    return result.recordset[0];
  }

  // User-actitvity methods

  // Read user-activities
  async readUserActivities(userId) {
    await this.connect();
    const request = this.poolconnection.request();
    request
      .input('userId', sql.Int, userId);
    const result = await request.query(`
    SELECT *
    FROM eksamen.user_activities
    JOIN eksamen.activity 
    ON eksamen.user_activities.activityId = eksamen.activity.activityId
    WHERE userId = @userId;
  `);
    return result.recordsets[0];
  }

  //create 
  async createActivity(data) {
    await this.connect();

    const request = this.poolconnection.request();

    request.input('activityId', sql.Int, data.activityId);
    request.input('userId', sql.Int, data.userId);
    request.input('dateAndTimeOfActivity', sql.DateTime, data.dateAndTimeOfActivity);
    request.input('durationOfActivityInMinutes', sql.Int, data.durationOfActivityInMinutes);

    const result = await request.query(`
    INSERT INTO eksamen.user_activities (activityId, userId, dateAndTimeOfActivity, durationOfActivityInMinutes, burnedKcal)
  VALUES (@activityId, @userId, @dateAndTimeOfActivity, @durationOfActivityInMinutes, (SELECT burnedKcalPrHour FROM eksamen.activity WHERE activityId = @activityId) * @durationOfActivityInMinutes/60);
    `);
    return result.rowsAffected[0];
  }

  // Update user-activity
  async updateUserActivities(data) { // hjælp til denne metode
    await this.connect();
    const request = this.poolconnection.request();

    request.input('user_activitiesId', sql.Int, data.user_activitiesId);
    request.input('dateAndTimeOfActivity', sql.DateTime, data.dateAndTimeOfActivity);
    request.input('durationOfActivityInMinutes', sql.Int, data.durationOfActivityInMinutes);

    const result = await request.query(`
    UPDATE eksamen.user_activities
    SET dateAndTimeOfActivity = @dateAndTimeOfActivity,
    durationOfActivityInMinutes = @durationOfActivityInMinutes,
    burnedKcal = (SELECT burnedKcalPrHour FROM eksamen.activity WHERE activityId = (SELECT activityId FROM eksamen.user_activities WHERE user_activitiesId = @user_activitiesId)) * @durationOfActivityInMinutes/60
    WHERE user_activitiesId = @user_activitiesId;
    `);

    return result.rowsAffected[0];
  }

  // Delete user-activity
  async deleteUseractivity(user_activitiesId) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .input('user_activitiesId', sql.Int, user_activitiesId)
      .query(`
    DELETE FROM eksamen.user_activities 
    WHERE user_activitiesId = @user_activitiesId
  `);
    return result.rowsAffected[0];
  }

  async deleteAllUserActivities(userId) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .input('userId', sql.Int, userId)
      .query(`
    DELETE FROM eksamen.user_activities 
    WHERE userId = @userId;
  `);
    return result.rowsAffected[0];
  }
}