export default class Player {
  public id!: number;
  public name!: string;
  public score!: number;
  public time!: number;

  constructor(id: number) {
    this.id = id;
  }
}
