import { Sequelize, Model, Optional, DataTypes } from 'sequelize';

const sequelize = new Sequelize('mysql://frontier:frontier@localhost:3306/worldbankindicators');

interface IndicatorAttributes {
  id: number;
  name: string;
};

interface IndicatorInformationAttributes {
  id: number;
  indicator: number;
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
  topic: number;
};

interface SpecificSubjectAttributes extends CodeSegment {
  indicator: number;
  general_subject: number;
};

class Indicator extends Model<IndicatorAttributes, Optional<IndicatorAttributes, "id">> implements IndicatorAttributes {
  public id!: number;
  public name!: string;
}

class IndicatorInformation extends Model<IndicatorInformationAttributes, Optional<IndicatorInformationAttributes, "id">> implements IndicatorInformationAttributes {
  public id!: number;
  public indicator!: number;
  public year!: number;
  public value!: number;
}

class Topic extends Model<TopicAttributes, Optional<TopicAttributes, "id">>  implements TopicAttributes {
  public id!: number;
  public code!: string;
  public name!: string;
  public topic!: number;
}

class GeneralSubject extends Model<GeneralSubjectAttributes, Optional<GeneralSubjectAttributes, "id">> implements GeneralSubjectAttributes {
  public id!: number;
  public code!: string;
  public name!: string;
  public topic!: number;
}

class SpecificSubject extends Model<SpecificSubjectAttributes, Optional<SpecificSubjectAttributes, "id">> implements SpecificSubjectAttributes {
  public id!: number;
  public code!: string;
  public indicator!: number;
  public general_subject!: number;
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
    indicator: {
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
    topic: {
      type: DataTypes.INTEGER,
    }
  },
  {
    indexes: [{ unique: true, fields: ['code', 'topic'] }],
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
    indicator: {
      type: DataTypes.INTEGER,
      unique: true,
    },
    general_subject: {
      type: DataTypes.INTEGER,
    }
  },
  {
    indexes: [{ unique: true, fields: ['code', 'general_subject'] }],
    sequelize,
    tableName: 'specific_subjects',
    timestamps: false
  }
);

IndicatorInformation.belongsTo(Indicator, {  foreignKey: 'indicator' });

Topic.hasMany(GeneralSubject, { sourceKey: 'id', foreignKey: 'topic' });

GeneralSubject.hasMany(SpecificSubject, { sourceKey: 'id', foreignKey: 'general_subject' });

SpecificSubject.hasOne(Indicator, { sourceKey: 'indicator', foreignKey: 'id' });

export {
  Indicator,
  IndicatorInformation,
  Topic,
  GeneralSubject,
  SpecificSubject,
};