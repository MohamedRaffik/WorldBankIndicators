CREATE TABLE indicators (
  id INT AUTO_INCREMENT,
  name TEXT,
  code VARCHAR(25) UNIQUE,
  PRIMARY KEY(id)
);

CREATE TABLE indicator_information (
  id INT AUTO_INCREMENT,
  indicator_id INT REFERENCES indicators(id) ON UPDATE CASCADE ON DELETE CASCADE,
  year INT,
  value DOUBLE,
  PRIMARY KEY(id),
  CONSTRAINT uc UNIQUE(indicator_id, year)
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
  topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY(id),
  CONSTRAINT uc UNIQUE(code, topic_id)
);

CREATE TABLE specific_subjects (
  id INT AUTO_INCREMENT,
  code VARCHAR(20),
  indicator_id INT UNIQUE REFERENCES indicators(id),
  general_subject_id INT REFERENCES general_subjects(id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY(id)
);

