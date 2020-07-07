import { Sequelize, Model, Optional, DataTypes } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL as string, { dialect: 'mysql' });

interface IndicatorAttributes {
  id: number;
  code: string;
  name: string;
};

interface IndicatorInformationAttributes {
  id: number;
  indicator_id: number;
  year: number;
  value: number;
};

interface CodeSegment {
  id: number;
  code: string;
}

interface TopicAttributes extends CodeSegment {
  name: string;
};

interface GeneralSubjectAttributes extends CodeSegment {
  name: string;
  topic_id: number;
};

interface SpecificSubjectAttributes extends CodeSegment {
  indicator_id: number;
  general_subject_id: number;
};

class Indicator extends Model<IndicatorAttributes, Optional<IndicatorAttributes, "id">> implements IndicatorAttributes {
  public id!: number;
  public code!: string;
  public name!: string;
}

class IndicatorInformation extends Model<IndicatorInformationAttributes, Optional<IndicatorInformationAttributes, "id">> implements IndicatorInformationAttributes {
  public id!: number;
  public indicator_id!: number;
  public year!: number;
  public value!: number;
}

class Topic extends Model<TopicAttributes, Optional<TopicAttributes, "id">>  implements TopicAttributes {
  public id!: number;
  public code!: string;
  public name!: string;
}

class GeneralSubject extends Model<GeneralSubjectAttributes, Optional<GeneralSubjectAttributes, "id">> implements GeneralSubjectAttributes {
  public id!: number;
  public code!: string;
  public name!: string;
  public topic_id!: number;
}

class SpecificSubject extends Model<SpecificSubjectAttributes, Optional<SpecificSubjectAttributes, "id">> implements SpecificSubjectAttributes {
  public id!: number;
  public code!: string;
  public indicator_id!: number;
  public general_subject_id!: number;
}

const id = {
  type: DataTypes.INTEGER,
  autoIncrement: true,
  primaryKey: true
};

Indicator.init(
  {
    id,
    name: {
      type: DataTypes.TEXT,
    },
    code: {
      type: DataTypes.TEXT
    }
  }, 
  { 
    sequelize, 
    tableName: 'indicators',
    timestamps: false
  }
);

IndicatorInformation.init(
  {
    id,
    indicator_id: {
      type: DataTypes.INTEGER,
      unique: true
    },
    year: {
      type: DataTypes.INTEGER,
    },
    value: {
      type: DataTypes.DOUBLE,
    },
  }, 
  {
    sequelize,
    tableName: 'indicator_information',
    timestamps: false
  }
);

Topic.init(
  {
    id,
    code: {
      type: DataTypes.CHAR(2),
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      unique: true
    }
  }, 
  {
    sequelize,
    tableName: 'topics',
    timestamps: false
  }
);

GeneralSubject.init(
  {
    id,
    code: {
      type: DataTypes.CHAR(3),
    },
    name: {
      type: DataTypes.TEXT,
      unique: true
    },
    topic_id: {
      type: DataTypes.INTEGER,
    }
  },
  {
    indexes: [{ unique: true, fields: ['code', 'topic_id'] }],
    sequelize,
    tableName: 'general_subjects',
    timestamps: false
  }
);

SpecificSubject.init(
  {
    id,
    code: {
      type: DataTypes.CHAR(20)
    },
    indicator_id: {
      type: DataTypes.INTEGER,
      unique: true,
    },
    general_subject_id: {
      type: DataTypes.INTEGER,
    }
  },
  {
    indexes: [{ unique: true, fields: ['code', 'general_subject_id'] }],
    sequelize,
    tableName: 'specific_subjects',
    timestamps: false
  }
);

Indicator.hasMany(IndicatorInformation, { sourceKey: 'id', foreignKey: 'indicator_id' });
Indicator.hasOne(SpecificSubject, { sourceKey: 'id', foreignKey: 'indicator_id' });

IndicatorInformation.belongsTo(Indicator, { foreignKey: 'indicator_id' });

Topic.hasMany(GeneralSubject, { sourceKey: 'id', foreignKey: 'topic_id' });

GeneralSubject.belongsTo(Topic, { foreignKey: 'topic_id' });
GeneralSubject.hasMany(SpecificSubject, { sourceKey: 'id', foreignKey: 'general_subject_id' });

SpecificSubject.belongsTo(GeneralSubject, { foreignKey: 'general_subject_id' });
SpecificSubject.belongsTo(Indicator, { foreignKey: 'indicator_id' });

export {
  Indicator,
  IndicatorInformation,
  Topic,
  GeneralSubject,
  SpecificSubject,
};