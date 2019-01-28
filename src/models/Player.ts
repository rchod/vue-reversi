export class Player {
  public id!: number;
  public name!: string;
  public score!: number;
  public time!: number;

  constructor(id: number) {
    this.id = id;
    this.score = 0;
    this.time = 0;
  }
}
