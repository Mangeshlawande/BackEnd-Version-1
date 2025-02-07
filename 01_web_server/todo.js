const fs = require("fs");
const filePath = './tasks.json';

/**
 * in the world of if want grab any cmd
    todo.js add "maggie"
 reading a file equally dengerous as meke a web request 

 */

 const loadTask= ()=>{
    try {
       const dataBuffer = fs.readFileSync(filePath);// it gives a data buffer [object] needs to convert into string 
       const dataJSON = dataBuffer.toString() // data json is different from regular json 
        return JSON.parse(dataJSON);
    } catch (error) {
        return []
    }
 };

 const saveTask = (tasks) =>{
    const dataJSON = JSON.stringify(tasks);
    fs.writeFileSync(filePath, dataJSON);
    console.log("Task added !!",tasks);
    
 }
 
 listTasks = () => {
    const tasks = loadTask();
    tasks.forEach((task, index )=> {
        console.log(`${index +1} -- ${task.task}`);

    });

 }
         
const addTask = (task)=> {
    const tasks = loadTask();
    tasks.push({task})
    saveTask(tasks);
}

 const command = process.argv[2]; // To grab the cmd 
 const argument = process.argv[3]; // To grab the argument 


if(command === 'add'){
    addTask(argument)
}else if (command === 'list'){
    listTasks();
}else if(command === 'remove'){
    removeTask(parseInt(argument))
    // id array ,object
} else{
    console.log("Command not found !!");
    
}