$(document).ready(function () {

    $("#calendar td").click(function() {
        $("#dialog").data("container", $(this).find("div.events").first()) // pass the container which will be used later to add event
            .dialog("open");
    });

    $("#dialog").dialog({
        autoOpen: false,
        draggable: false,
        height: 300,
        width: 500,
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

                        // delete button
                        $("<span class=\"ui-icon ui-icon-closethick\"></span>")
                            .click(function(e) {
                                $(this).parent().remove();
                                e.stopPropagation();
                            })
                            .appendTo(newEvent);

                        // make draggable with revert (so that later, cannot be dropped where there already are events )
                        newEvent.draggable({ revert: true });

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
        close: function() {
            resetDialogForm();
        }
    });
    
    const resetDialogForm = function() {
        $("#subject-input").val("");
        $("#slot-input").val("AM");
        $("#event-color-input").val("#38BFC5"); // some default value
        $("#form-error").text("");
    }

    $("#calendar td").droppable({
        accept: function(el) {
            // check that cell does not already contain a pm-even or a am-event, using classes
            return el.hasClass("pm-event") && $(this).find(".pm-event").length == 0
                || el.hasClass("am-event") && $(this).find(".am-event").length == 0;
        },
        drop: function(event, ui) {
            
            const calEvent = ui.draggable; // this is the element that is being dragged

            const eventsDiv = $(this).find("div.events").first(); // $this refers to the cell (day of the month) where it is being dropped

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
