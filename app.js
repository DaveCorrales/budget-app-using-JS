//BUDGET CONTROLLER

var budgetController = (function (){

    //expense constructor
    var Expense = function(id, description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100 );
        }else {
            this.percentage = -1;
        }
        
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    //income constructor    
    var Income = function(id, description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }   

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    };

    // this how jonas do his data structure.
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage:-1
    };

    return {
        addItem: function(type, des ,val){
            var newItem, ID;


            //create new id
            //we use if cuz array is empty and its -1 its gonna be error
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else  {
                ID = 0;
            }

            
            
            
            //create new item based in "inc" or "exp" typwe
            if (type ==="exp"){
                newItem = new Expense(ID, des,val);
            }else if (type === "inc"){
                newItem = new Income(ID,des,val);
            }

            //pushh it into our data structure
            data.allItems[type].push(newItem);

            //return the new element
            return newItem; 
        },

        deleteItem: function(type,id) {
            var ids, index;
            //id = 6
            //ids = [1 2  4 6 8]
            //index = 3


            var ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");
            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculte the percentage of income that we spent
            if ( data.totals.inc > 0 ){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else {
                data.percentage = -1;
            }
            
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
            
        },

        getPercentages: function(){
            //map stores data in a variable and for each doesnt not
            
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });

            return allPerc;
        },
        getBudget: function() {
           return {
               budget: data.budget,
               totalInc: data.totals.inc,
               totalExp: data.totals.exp,
               percentage: data.percentage
           };    

        },

        testing: function() {
            console.log(data)
        }
    }
})();


//UI CONTROLLER
var UIController = (function (){

    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercentageLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    var formatNumber = function(num, type){
        /* + or - before number
        exactly 2 decimal points
        comma separating the thousands

        2310.4567 -> +2,310.46
        2000 - > 2,000.00
        */
       var numSplit, int, dec;

        num = Math.abs(num);
        //is fixed is a number prototype.
        //this is automatically converts the last 2 numbers as example above
        //if 2000 => it will automatic put 2 zero in the end = 2000.00
        num = num.toFixed(2);

        //The split() method is used to split a string into an array of substrings, and returns the new array.
        numSplit = num.split(".")

        // this is where we put the ", " in every thousand
        int = numSplit[0];
        if(int.length > 3) {
            //we use method substring
            //0 is the first index of the array ofsplit  
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
        }
        dec  = numSplit[1];
        return (type === "exp" ?   "-" :   "+")  + " " + int + "." + dec;
    };

    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };


    //since we want this method to use in other method we are gonna make it public
    //we return an object
    return {
        getInput: function(){

            // we use return to store them in an *object* so they will be return at the same time
            return {
                type: document.querySelector(DOMstrings.inputType).value,//will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
            
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            //create HTML string with placeholder text
            if(type ==="inc"){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if (type ==="exp"){
                element = DOMstrings.expensesContainer;
                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //replace the placeholder text with some actual data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%",formatNumber(obj.value, type));
            

            //this is new replace method
            //insert the html into the dom

            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItemL: function(selectorID){
            var el = document.getElementById(selectorID)

            el(selectorID).parentNode.removeChild(el);
        },
        //this is how to clear the input
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + "," + DOMstrings.inputValue);
            //we use thisarray method called slice. its a trick 
            
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array){
                current.value = "";
            });
            // to put the coursier back to the description input
            fieldsArr[0].focus();
        },
        displayBudget: function(obj){

            obj.budget  > 0 ? type = "inc": type = "exp";

            document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expensesLabel).textContent=formatNumber(obj.totalExp, "exp");
            
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage + "%";

            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent= "----";
            }
        },
        
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

         
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                }else {
                    current.textContent = "---";
                }
                
               
            });
        },

        displayMonth: function(){
            var now, months, month,year;
            
            now = new Date();
            months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
        },

        changedType: function(){

            var fields = document.querySelectorAll(
                DOMstrings.inputType + "," + DOMstrings.inputDescription + "," + DOMstrings.inputValue);
            
                nodeListForEach(fields, function(cur){
                    cur.classList.toggle("red-focus");
                });

                document.querySelector(DOMstrings.inputBtn).classList.toggle("red-focus");

        },
        

        //we put this in public so we can re-use this in other method
        //new function and we return varbiale domstrings in line *11*
        getDomstrings: function() {
            return DOMstrings;
        }
    };

})();

//GOLBAL APP CONTROLLER 
var controller = (function(budgetCtrl,UIctrl){

    //all the evenlisteners we put it here. 
    //here we just organize code cuz in the previous code it was a little bit scattered.
    var setupEventListeners = function(){
        var DOM = UIctrl.getDomstrings();

        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem) 
        
        document.addEventListener("keypress", function (event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener("change", UIctrl.changedType);
    };

    var updateBudget = function(){
       //1.calculate the budget
        budgetCtrl.calculateBudget();
       //2.return the budget
        var budget = budgetCtrl.getBudget();
       //3.display the budget on the UI
        UIctrl.displayBudget(budget);
    }

   var updatePercentages = function(){
       //1. calculate percentage
      budgetCtrl.calculatePercentages();

       //2. read percentage grom the budet controller
        var percentages = budgetCtrl.getPercentages();
       //3. update the ui wth the new percentage
        UIctrl.displayPercentages(percentages);
        
   } 
  
    var ctrlAddItem = function() {

        var input, newItem;
         //1.get the field input data
        input = UIctrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
        //2. add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);


        //3. add the item to the UI

        UIctrl.addListItem(newItem, input.type);
        //4. calculate and update the budget
        
        
        //5. clear the fields
        UIctrl.clearFields();

        //calculate and update budget
        updateBudget();


        //6. calculate ang update percentages
        updatePercentages();


        }
        
        


        // just to test if this works!
       
    };
    var ctrlDeleteItem = function(event){
        var itemId, splitId,type,Id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId){
            splitId = itemId.split("-");
            type = splitId[0];
            Id= parseInt(splitId[1]);

            //1.delete the item from the data structure
            budgetCtrl.deleteItem(type, Id);

            //2. delete item from  the UI
            UIctrl.deleteListItemL(itemId);

            //3. calculate and update the UI
            updateBudget();

            //4. calculate and update percentage
            updatePercentages();
        }
    }

    //this is a public initilaztion function
    return {
        init: function(){
            console.log("Application started");
            UIctrl.displayMonth();
            UIctrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
    

    
})(budgetController, UIController);

//we gonna call this function outside so we can use it and get data because without this we dont have data
controller.init();