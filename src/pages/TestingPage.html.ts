import { AccessType, IElementHolder, Page, RePage } from "@Purper";


@RePage("./src/pages/TestingPage.phtml",
    "./src/pages/TestingPage.html.css",
    "./src/pages/TestingPage.html.ts",
    AccessType.BOTH,
    "/testing")
export default class TestingPage extends Page {
  private semestrs: Semestr[] = [
    new Semestr("&#8544;", []),
    new Semestr("&#8545;", [
      new Subject("InfTech", "Həsənov Elçin Qafar oğlu", ["759ITS"], "Инфоомационные технологии","s2/FunOfIT.json"),
      new Subject("BaseProg", "Həsənov Elçin Qafar oğlu", ["759ITS"], "Основы программирования","s2/Programming.json"),
      new Subject("DiffEqua", "Quliyeva Fətimə Ağayar qızı", ["759ITS", "759KM"], "Дифференциальные уравнения","s2/DifferentialEquations.json"),
      new Subject("Instrumental", "Gasanova Vusala Ramiz qızı", ["759ITS"], "Инструментальные и прикладные программы","s2/Vusala.json"),
      new Subject("Physics", "Əlizade Leyla Eldar qızı", ["759ITS", "759KM"], "Физика","s2/Physics.json"),
      new Subject("LinearAlgebra", "Quliyeva Fətimə Ağayar qızı", ["759ITS", "759KM"], "Линейная алгебра","s2/LinearAlgebra.json"),
      new Subject("English", "Ismayilova Aybəniz Arif qızı", ["759ITS", "759KM"], "Английский язык","s2/Eng.json"),
    ]),
    new Semestr("&#8546;", [
      /*new Subject("Verilənlər bazası sistemləri", "Kuliyev M.X", ["759ITS"], "Базы данных"),
      new Subject("Kompüter arxitekturası -1", "Kuliyev M.X", ["759ITS","759KM"], "Архитектура компьютера"),
      new Subject("Ehtimal nəzəriyyəsi və riyazi statistika", "Dos.Əliyeva X.H", ["759ITS","759KM"], "Математическая статистика"),
      new Subject("Web sistemləri və texnologiyaları", "Cəbrayılova G.H", ["759ITS"], "Веб системы и технологии"),
      new Subject("Xarici dildə işgüzar və akademik kommunikasiya  - 3", "İsmayılova A.A", ["759ITS","759KM"], "Английский язык"),
      new Subject("Sistem proqramlaşdırma", "Həsənova V.R", ["759ITS"], "Системное программирование"),*/
    ]),
  ]
  // intentionally empty page — no logic
  protected preLoad(holder: IElementHolder): Promise<void> {
    return Promise.resolve();
  }
}
class Semestr {
  private number: string;
  private subjects: Subject[];
  constructor(number: string, subjects: Subject[]) {
    this.number = number;
    this.subjects = subjects;
  }
}
export class Subject {
  public name: string;
  public translatedName?: string;
  public teacher: string;
  public file: string;
  public groups: string[];

  constructor(name: string, teacher: string, groups: string[], translatedName?: string, file?: string) {
    this.name = name;
    this.teacher = teacher;
    this.groups = groups;
    this.translatedName = translatedName;
    this.file = file;
  }
}
