import { AccessType, IElementHolder, Page, RePage } from "@Purper";


@RePage({
  markupURL: "./src/pages/TestingPage.phtml",
  cssURL: "./src/pages/TestingPage.html.css",
  jsURL: "./src/pages/TestingPage.html.ts",
  class: TestingPage,
}, "/testing")
export default class TestingPage extends Page {
  public semestrs: Semestr[] = [
    new Semestr("&#8544;", [
      new Subject("Riyazi Analiz", "p.ü.f.d. Səmədzadə F.N",["759ITS", "759KM"], "Математический анализ","s1/Math.json"),
    ]),
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
      new Subject("Verilənlər bazası sistemləri", "Kuliyev M.X", ["759ITS","759KM"], "Базы данных","s3/MySQL.json"),
      new Subject("Kompüter arxitekturası -1", "Kuliyev M.X", ["759ITS","759KM"], "Архитектура компьютера","s3/PCArch.json"),/*,
      new Subject("Ehtimal nəzəriyyəsi və riyazi statistika", "Dos.Əliyeva X.H", ["759ITS","759KM"], "Математическая статистика"),*/
      new Subject("Proqramlaşdırma əsasları - 2", "Kuliyev M.X", ["759KM"], "Программирование","s3/Program.json"),
      new Subject("Web sistemləri və texnologiyaları", "Cəbrayılova G.H", ["759ITS"], "Веб системы и технологии", "s3/Web.json"),
      new Subject("Dövrlər nəzəriyyəsi", "Qax.D.B", ["759KM"], "Теория цепей", "s3/ChainTheory.json"),
      new Subject("Sistem Programlaşdırma", "Gasanova Vusala Ramiz qızı", ["759ITS"], "Системное программирование [BETA]","s3/Vusala.json"),
      /*new Subject("Xarici dildə işgüzar və akademik kommunikasiya  - 3", "İsmayılova A.A", ["759ITS","759KM"], "Английский язык"),
      new Subject("Sistem proqramlaşdırma", "Həsənova V.R", ["759ITS"], "Системное программирование"),*/
    ]),
  ];
  protected async preInit(): Promise<void> {
    this.semestrs.reverse();
  }
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
