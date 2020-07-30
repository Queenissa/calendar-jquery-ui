$(document).ready(function () {
    
    // default dialog params 
    $("#dialog").dialog({
        autoOpen: false,
        draggable: false,
        height: 300,
        width: 500,
        close: function() {
            resetDialogForm();
        }
    });

    // click to add event
    $("#calendar td").click(function() {
        $("#dialog").dialog({
            title: "Add event", 
            buttons: {
                Done: function () {
                    const subj = $("#subject-input").val();
                    const slot = $("#slot-input").val();
                    const color = $("#event-color-input").val();
                    
                    if (subj !== "" && slot !== "" && color !== "") {
    
                        // check existing events on the given slot, using the class
                        const existing = $(this).data("container").find("." + slot.toLowerCase()+"-event");
                        if (existing.length > 0) {
                            $("#form-error").text("Slot is already taken");
    
                        } else {
    
                            // create the event div
                            const newEvent = $("<div></div>")
                                .text(slot + ": " + subj)
                                .css("background-color", color)
                                .addClass(slot.toLowerCase()+"-event"); // class to use later
    
                            addDeleteButton(newEvent);
    
                            // make draggable with revert (so that later, cannot be dropped where there already are events )
                            newEvent.draggable({ revert: true });
    
                            // make editable
                            newEvent.click(function(e) {
                                openEditDialog($(this));
                                e.stopPropagation();
                            })
    
                            // append or prepend
                            if (slot === "PM") {
                                $(this).data("container").append(newEvent);
                            } else {
                                $(this).data("container").prepend(newEvent);
                            }
                            
                            // reset & close
                            resetDialogForm();
                            $(this).dialog("close");
                        }
    
                    } else {
                        // in case data is empty
                        $("#form-error").text("Please fill in all data");
                    }
                }
            },    
        })    
        .data("container", $(this).find("div.events").first()) // pass the container which will be used later to add event
        .dialog("open");
    });

    resetDialogForm = () => {
        $("#subject-input").val("");
        $("#slot-input").val("AM");
        $("#event-color-input").val("#38BFC5");
        $("#form-error").text("");
    }

    addDeleteButton = (element) => {
        $("<span class=\"ui-icon ui-icon-closethick\"></span>")
        .click(function(e) {
            $(this).parent().remove();
            e.stopPropagation();
        })
        .appendTo(element);
    };

    // to make events editables 
    const openEditDialog = function(calEvent) {

        // get data of existing calendar event
        const subj = calEvent.text().split(": ")[1];
        const slot = calEvent.text().split(": ")[0];
        const color = rgbToHex(calEvent.css("background-color")); // because the .css returns it in rgb, but we need hex for the HTML input
        
        // fill in dialog form with previous data
        $("#subject-input").val(subj);
        $("#slot-input").val(slot);
        $("#event-color-input").val(color);

        $("#dialog").dialog({
            title:"Edit event",
            buttons: {
                Save: function() {
                    // get the new data
                    const newSubj = $("#subject-input").val();
                    const newSlot = $("#slot-input").val();
                    const newColor = $("#event-color-input").val();
                    
                    if (newSubj == "" || newSlot == "" || newColor == "") {
                        $("#form-error").text("Please fill in all data");

                    // handle error when slot is changed and new slot is already taken
                    } else if (newSlot !== slot && calEvent.parent().find("." + newSlot.toLowerCase()+"-event").length > 0) {
                        $("#form-error").text("Slot is already taken");

                    } else {
                        calEvent.text(newSlot + ": " + newSubj)
                                .css("background-color", newColor)
                                .removeClass(slot.toLowerCase()+"-event")
                                .addClass(newSlot.toLowerCase()+"-event");

                        addDeleteButton(calEvent); // need again because the replacement of text also removes the button
    
                        // reset & close
                        resetDialogForm();
                        $(this).dialog("close");
                    } 
                }
            }
        })
        .dialog("open");
    };

    // utility function to convert RGB color to Hexa
    rgbToHex = (rgbStr) => '#' + rgbStr.match(/\d+/g).map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');


    // make all calendar cells droppable
    $("#calendar td").droppable({
        accept: function(el) {
            // check that cell does not already contain a pm-even or a am-event, using classes
            return el.hasClass("pm-event") && $(this).find(".pm-event").length == 0
                || el.hasClass("am-event") && $(this).find(".am-event").length == 0;
        },
        drop: function(event, ui) {
            
            // this is how we get the current dragged event
            const calEvent = ui.draggable;

            const eventsDiv = $(this).find("div.events").first();

            if (calEvent.hasClass("pm-event")) {
                eventsDiv.append(calEvent);
            } else if (calEvent.hasClass("am-event")) {
                eventsDiv.prepend(calEvent);
            }

            // to fix new event at the top left of the new container
            calEvent.css({top: '0', left: '0'});
        }
    });



})
