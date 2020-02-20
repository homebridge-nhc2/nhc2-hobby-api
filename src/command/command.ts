export interface Command {
  topic: string;
  data: {
    Method: string;
    Params?: any;
  };
}
