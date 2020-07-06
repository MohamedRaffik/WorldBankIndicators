CREATE TABLE indicators (
  id INT AUTO_INCREMENT,
  name TEXT,
  PRIMARY KEY(id)
);

CREATE TABLE indicator_information (
  id INT AUTO_INCREMENT,
  indicator INT REFERENCES indicators(id) ON UPDATE CASCADE ON DELETE CASCADE,
  year INT,
  value DOUBLE,
  PRIMARY KEY(id),
  CONSTRAINT uc UNIQUE(indicator, year)
);

CREATE TABLE topics (
  id INT AUTO_INCREMENT, 
  code CHAR(2) UNIQUE, 
  name TEXT,
  PRIMARY KEY(id)
);

CREATE TABLE general_subjects (
  id INT AUTO_INCREMENT,
  code CHAR(3),
  name TEXT,
  topic INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY(id),
  CONSTRAINT uc UNIQUE(code, topic)
);

CREATE TABLE specific_subjects (
  id INT AUTO_INCREMENT,
  code VARCHAR(20),
  indicator INT UNIQUE REFERENCES indicators(id),
  general_subject INT REFERENCES general_subjects(id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY(id),
  CONSTRAINT uc UNIQUE(code, general_subject)
);

