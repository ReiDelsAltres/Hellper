var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Page, RePage } from "@Purper";
let TestingPage = class TestingPage extends Page {
    semestrs = [
        new Semestr("&#8544;", [
            new Subject("Riyazi Analiz", "p.ü.f.d. Səmədzadə F.N", ["759ITS", "759KM"], "Математический анализ", "s1/Math.json"),
        ]),
        new Semestr("&#8545;", [
            new Subject("InfTech", "Həsənov Elçin Qafar oğlu", ["759ITS"], "Инфоомационные технологии", "s2/FunOfIT.json"),
            new Subject("BaseProg", "Həsənov Elçin Qafar oğlu", ["759ITS"], "Основы программирования", "s2/Programming.json"),
            new Subject("DiffEqua", "Quliyeva Fətimə Ağayar qızı", ["759ITS", "759KM"], "Дифференциальные уравнения", "s2/DifferentialEquations.json"),
            new Subject("Instrumental", "Gasanova Vusala Ramiz qızı", ["759ITS"], "Инструментальные и прикладные программы", "s2/Vusala.json"),
            new Subject("Physics", "Əlizade Leyla Eldar qızı", ["759ITS", "759KM"], "Физика", "s2/Physics.json"),
            new Subject("LinearAlgebra", "Quliyeva Fətimə Ağayar qızı", ["759ITS", "759KM"], "Линейная алгебра", "s2/LinearAlgebra.json"),
            new Subject("English", "Ismayilova Aybəniz Arif qızı", ["759ITS", "759KM"], "Английский язык", "s2/Eng.json"),
        ]),
        new Semestr("&#8546;", [
            new Subject("Verilənlər bazası sistemləri", "Kuliyev M.X", ["759ITS", "759KM"], "Базы данных", "s3/MySQL.json"),
            new Subject("Kompüter arxitekturası -1", "Kuliyev M.X", ["759ITS", "759KM"], "Архитектура компьютера", "s3/PCArch.json"), /*,
            new Subject("Ehtimal nəzəriyyəsi və riyazi statistika", "Dos.Əliyeva X.H", ["759ITS","759KM"], "Математическая статистика"),*/
            new Subject("Proqramlaşdırma əsasları - 2", "Kuliyev M.X", ["759KM"], "Программирование", "s3/Program.json"),
            new Subject("Web sistemləri və texnologiyaları", "Cəbrayılova G.H", ["759ITS"], "Веб системы и технологии", "s3/Web.json"),
            new Subject("Dövrlər nəzəriyyəsi", "Qax.D.B", ["759KM"], "Теория цепей", "s3/ChainTheory.json"),
            new Subject("Sistem Programlaşdırma", "Gasanova Vusala Ramiz qızı", ["759ITS"], "Системное программирование [BETA]", "s3/Vusala.json"),
            /*new Subject("Xarici dildə işgüzar və akademik kommunikasiya  - 3", "İsmayılova A.A", ["759ITS","759KM"], "Английский язык"),
            new Subject("Sistem proqramlaşdırma", "Həsənova V.R", ["759ITS"], "Системное программирование"),*/
        ]),
    ];
    async preInit() {
        this.semestrs.reverse();
    }
    // intentionally empty page — no logic
    preLoad(holder) {
        return Promise.resolve();
    }
};
TestingPage = __decorate([
    RePage({
        markupURL: "./src/pages/TestingPage.phtml",
        cssURL: "./src/pages/TestingPage.html.css",
        jsURL: "./src/pages/TestingPage.html.ts",
        class: TestingPage,
    }, "/testing")
], TestingPage);
export default TestingPage;
class Semestr {
    number;
    subjects;
    constructor(number, subjects) {
        this.number = number;
        this.subjects = subjects;
    }
}
export class Subject {
    name;
    translatedName;
    teacher;
    file;
    groups;
    constructor(name, teacher, groups, translatedName, file) {
        this.name = name;
        this.teacher = teacher;
        this.groups = groups;
        this.translatedName = translatedName;
        this.file = file;
    }
}
//# sourceMappingURL=TestingPage.html.js.map