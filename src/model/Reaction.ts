import smile from "/src/assets/images/reactions/smile.png?url"
import angry from "/src/assets/images/reactions/angry.png?url"
import heart from "/src/assets/images/reactions/heart.png?url"
import like from "/src/assets/images/reactions/like.png?url"
import sigma from "/src/assets/images/reactions/sigma.png?url"
import surprised from "/src/assets/images/reactions/surprised.png?url"

class Reaction {
    name: string
    image: string

    constructor(name: string, image: string) {
        this.name = name;
        this.image = image;
    }
}

const reactions = new Map<string, Reaction>([
    ["smile", new Reaction("smile", smile)],
    ["angry", new Reaction("angry", angry)],
    ["heart", new Reaction("heart", heart)],
    ["like", new Reaction("like", like)],
    ["sigma", new Reaction("sigma", sigma)],
    ["surprised", new Reaction("surprised", surprised)]
]);

export { Reaction, reactions };
export default Reaction;
