// ->   Undo redo functionality currently uses two lists 1. undoStack and 2. redoStack. 
// ->   Plan is to change it and use only one stack called historyStack and have 3 pointers pointing to current, previous and next
//      frames in the stack. 
// ->   Every time a new frame is pushed, undo or redo is clicked these pointers will be udpated.



// add below lines to initializationi section
let historyStack = [];
let currentPosition = -1;
let prevPosition = -1;
let nextPosition = -1;

const updatePointers = () => {

    // below liens are part of this function
    currentPosition += 1;
    prevPosition = currentPosition - 1;
    nextPosition = currentPosition + 1;
};

historyStack.push(currentStackFrame);
updatePointers();
