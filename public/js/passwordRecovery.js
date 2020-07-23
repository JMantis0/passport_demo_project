$(document).ready(() => {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page

  $("form.accountSearch").on("submit", (event) => {
    event.preventDefault();
    const searchForThisEmail = $("#email-input").val().trim();
    //  update the current user's password question and answer
    $.post("/api/members/passwordRecovery/searchForAccount", {
      email: searchForThisEmail
    })
      .then((result) => {
        console.log(result);
        $("#alert").hide();
      })
      .catch(handleLoginErr);
  });

  function handleLoginErr(err) {
    // console.log("**signup.js 39**", err, "err.responseJSON.fields.users.email",err.responseJSON.fields.users);
    $("#alert .msg").text("Account does not exist");
    $("#alert").fadeIn(500);
  }

});
