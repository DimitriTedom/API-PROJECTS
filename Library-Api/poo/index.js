class Car{
    constructor(essence,key){
        this.name = "Limosine";
        this.key = key;
        this.essence = essence;
    }

    SwitchOnCar(){
        if (!this.essence || !this.key) {
            console.log("The car is lacking Kerosen and a key")
        }else{
            console.log("The car is ON")
        }
    }
    StopCar(){
                if (this.essence || this.key) {
            console.log("The car can't stop since the key is not removed nor lacking Kerosene")
        }else{
            console.log("The car is OFF")
        }
    }
}

const car1 = new Car(true,true);

console.log(car1.SwitchOnCar())
console.log(car1.StopCar())
//fonctionalite d'amazon efs