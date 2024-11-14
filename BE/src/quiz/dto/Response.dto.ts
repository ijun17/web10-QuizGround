export class Result<T> {
  constructor(data: T) {
    this.quizSetList = data;
  }

  quizSetList: T;
}
