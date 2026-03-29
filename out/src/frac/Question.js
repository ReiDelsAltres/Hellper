export class Semestr {
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
//# sourceMappingURL=Question.js.map