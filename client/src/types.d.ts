interface IndicatorInfo {
  id: number;
  indicator_id: number;
  year: number;
  value: number;
}

interface Indicator {
  id: number;
  name: string;
  code: string;
};

interface Topic {
  id: number;
  code: string;
  name: string;
}

interface GeneralSubject extends Topic {
  topic_id: number;
}