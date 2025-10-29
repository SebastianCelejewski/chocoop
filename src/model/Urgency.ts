class Urgency {

    level: number;
    label: string;
    timeUnit: number;

    constructor (level: number, label: string, timeUnit: number) {
        this.level = level;
        this.label = label;
        this.timeUnit = timeUnit;
    }
}

const urgencyList = new Array(
        new Urgency(0, "Jak najszybciej", 60*1000),
        new Urgency(1, "W ciągu paru godzin", 60*60*1000),
        new Urgency(2, "W ciągu paru dni", 24*60*60*1000),
        new Urgency(3, "W ciągu paru tygodni", 7*24*60*60*1000),
        new Urgency(4, "W ciągu paru miesięcy", 30*24*60*60*1000),
        new Urgency(5, "Bez konkretnego terminu", 0)
    )

export { Urgency, urgencyList };