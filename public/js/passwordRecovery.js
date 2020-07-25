$(document).ready(() => {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page
  const alert = $("#alert");

  $("form.accountSearch").on("submit", (event) => {
    event.preventDefault();
    const searchForThisEmail = $("#email-input").val().trim();
    //  Send email to backend to see if an account exists and to get it's password Recovery question
    $.post("/api/passwordRecovery/searchForAccount", {
      email: searchForThisEmail
    })
      .then((recoveryQuestion) => {
        console.log(recoveryQuestion);
        alert.hide();
        const answerSearchForm = $("<form>");
        const formGroup = $("<div>");
        const recoveryAnswerInputLabel = $("<label>");
        const recoveryAnswerInput = $("<input>");
        const recoveryAnswerButton = $("<button>");
        answerSearchForm.addClass("recoveryAnswer");
        formGroup.addClass("form-group");
        recoveryAnswerInputLabel.attr("for", "recoveryAnswerInput");
        recoveryAnswerInputLabel.text(recoveryQuestion);
        recoveryAnswerInput.addClass("form-control");
        recoveryAnswerInput.attr("type", "answer"); //read about bootstrap class form-control
        recoveryAnswerInput.attr("id", "answer-input");
        recoveryAnswerInput.attr("placeholder", "Your answer");
        recoveryAnswerButton.addClass("btn btn-default");
        recoveryAnswerButton.attr("type", "submit");
        recoveryAnswerButton.text("Submit Answer");
        formGroup.append(recoveryAnswerInputLabel);
        formGroup.append(recoveryAnswerInput);
        answerSearchForm.append(formGroup);
        answerSearchForm.append(alert);
        answerSearchForm.append(recoveryAnswerButton);
        answerSearchForm.appendTo($("form.accountSearch").parent());
        $("form.accountSearch button").hide();
        //make email input read only.
        $("#email-input").attr("readonly", "true");

        //  Assign handler for the form that was just appended (answerSearchForm);
        $("form.recoveryAnswer").on("submit", (event) => {
          event.preventDefault();
          const answerSubmission = recoveryAnswerInput.val().trim();
          //  also want to send the email.
          // send the answer to the backend to see if the use answer matches the answer in the database
          $.post("/api/passwordRecovery/matchAnswer", {
            email: searchForThisEmail,
            recoveryAnswer: answerSubmission
          }).then((answerResult) => {
            alert.hide();
            //Possibilities :  Answer matched!  ask user to set a new password
            //              :  Answer didn't match!  Alert incorrect answer
            console.log(answerResult);
            if (answerResult) {
              console.log("append password reset form");
            } else {
              console.log("inside else 57 apiroutes");
              alert.hide();
              alert.text("Incorrect answer");
              alert.fadeIn(500);
            }
          });
        });
      })
      .catch(handleLoginErr);
  });

  function handleLoginErr(err) {
    // console.log("**signup.js 39**", err, "err.responseJSON.fields.users.email",err.responseJSON.fields.users);
    $("#alert .msg").text("Account does not exist");
    $("#alert").fadeIn(500);
  }
});
