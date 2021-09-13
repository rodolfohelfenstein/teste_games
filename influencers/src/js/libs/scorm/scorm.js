/*
** Perugluglu SCORMer
** Author: Andre Monello @Perugluglu Interactive @Sao Paulo, Brasil
**
** This can be used to integrate SCORM 1.2 into your HTML5 games,
** along with the HTML, JS and any other files.Project can be
** imported to SCORM Cloud platform.
**
** It uses Pipwerks SCORM Wrapper for JavaScript
** https://github.com/pipwerks/scorm-api-wrapper
*/


var scormVars = {
    scorm: pipwerks.SCORM,  // Used to access Pipwerks SCORM Wrapper
    lmsConnected: false,  // Checks if coonected to the LMS
    lessonStatus: null,  // Stores course status (from LMS)
    studentName: '',  // Stores student name (from LMS)
    unloaded: false,  // Used when checking if window is being closed
    scormEntry: null,  // Stores if it's a user's first time accessing the course
    dataToString: null,  // Receives data to be stringfied before sending to SCORM suspend_data
    setSuspendData: null,  // Receives stringfied data and saves it into SCORM suspend_data
    getSuspendData: null,  // Receives SCORM suspend_data. It has to be parsed BEFORE being used by the script!
    parseData: null,  // Used to store parsed data received from SCORM suspend_data
    studentID: ''
}

var scormFunctions = {
    // Initializes SCORM course
    scormInit: function() {
        scormFunctions.initCourse();
    },

    // Initializes course main functions
    initCourse: function() {
        scormVars.lmsConnected = scormVars.scorm.init();
        scormVars.lessonStatus = scormVars.scorm.get('cmi.core.lesson_status');
        scormVars.scormEntry = scormVars.scorm.get('cmi.core.entry');

        if (scormVars.lmsConnected) {
            scormFunctions.getStudentName();
            scormFunctions.getStudentID();
            
            if (scormVars.lessonStatus === 'completed' || scormVars.lessonStatus === 'passed') {
                console.error('Você já terminou esta lição.\nNão precisa fazer isso novamente.');
            }

            else {
                scormFunctions.setWelcomeMessage();

                /*if (scormVars.scormEntry !== 'ab-initio') {
                    scormFunctions.loadSuspendData();
                }*/
            }
        }

        else {
            console.error('Falha ao se conectar com o LMS!');
        }
    },

    // Sets course completion status to completed
    setComplete: function() {
        if (scormVars.lmsConnected) {
            scormVars.scorm.set('cmi.core.lesson_status', 'completed');
        }
    },

    setLessonLocation: function(page) {
        var res = scormVars.scorm.set('cmi.core.lesson_location', page);

        scormFunctions.saveSuspendData();
        scormVars.scorm.save();
    },

    // Saves data to SCORM suspend_data
    saveSuspendData: function() {
        // Data stored in data.js has to be JSON.stringify-ed and stored into dataToString
        // and then setSuspendData stores it into SCORM suspend_data
        scormVars.dataToString = JSON.stringify(scormSuspendData);
        scormVars.setSuspendData = scormVars.scorm.set('cmi.suspend_data', scormVars.dataToString);
    },

    // Loads data from SCORM suspend_data
    loadSuspendData: function() {
        scormVars.getSuspendData = scormVars.scorm.get('cmi.suspend_data');

        if (scormVars.getSuspendData != '{}' && scormVars.getSuspendData != 'null') {
            scormVars.parseData = JSON.parse(scormVars.getSuspendData);
            // Data parsed by parseData has to be stored back into data.js and
            // then it can be used by the script
            scormSuspendData = scormVars.parseData;
        }
    },

    // Receives student_name from LMS, divides it into an array of strings and reverses it
    // to be used throughout the project
    getStudentName: function() {
        scormVars.studentName = scormVars.scorm.get('cmi.core.student_name').split(',').reverse().join(' ');
    },

    getStudentID: function() {
        scormVars.studentID = scormVars.scorm.get('cmi.core.student_id');
    },

    // It sets an welcome message using student's name received
    // Mainly used in Perugluglu's own projects but left here for future reference
    setWelcomeMessage: function() {
        // If it's an user's first time accessing the course...
    },

    // Saves current course status
    unloadHandler: function() {
        if(!scormVars.unloaded) {
            scormFunctions.saveSuspendData();
            scormVars.scorm.save();
            scormVars.scorm.quit();
            scormVars.unloaded = true;
        }
    },

}

// Calls save function when the user leaves the page
window.onbeforeunload = scormFunctions.unloadHandler;
window.onunload = scormFunctions.unloadHandler;

$(document).ready(function(){
    scormFunctions.scormInit();
});