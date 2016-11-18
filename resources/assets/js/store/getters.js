/*Tasks Getters*/
export const allTasks = ({tasks}) => tasks.all;
export const completedTasks = ({tasks}) =>  tasks.all.filter(task => task.complete);
export const incompleteTasks = ({tasks}) => tasks.all.filter(task => !task.complete);