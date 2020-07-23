$(document).ready(function() {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page
  $.get("/api/user_data").then(function(data) {
    $(".member-name").text(data.email);
  });

  $("form.passwordRecovery").on("submit", (event) => {
    event.preventDefault();
    const recoveryQuestion = $("#passwordRecoverySelect").find(":selected").text();
    const recoveryAnswer = $("#passwordRecoveryAnswerInput").val();

    const passwordInfo = {
      recoveryQuestion,
      recoveryAnswer
    }

    //  update the current user's password question and answer
    $.ajax(
      {
        url: "/api/members/passwordRecovery",
        type: "PUT",
        data: passwordInfo
      }).then(result => {
      console.log(result);
    });
  });
});
  
