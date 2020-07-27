$(document).ready(() => {
  const mother = $("#mother");
  //  Builds a bootstrap form with a label, input, button, and a hidden alert.
  function createForm(
    formName,
    labelString,
    placeholderString,
    inputType,
    buttonString
  ) {
    //  Element Creation
    const form = $("<form>");
    const formGroup = $("<div>");
    const inputLabel = $("<label>");
    const input = $("<input>");
    const alert = $("<div>");
    const alertGlyph = $("<span>");
    const alertError = $("<span>");
    const alertMessage = $("<span>)");
    const button = $("<button>");

    //  Attribute assignments
    form.addClass(formName);
    form.attr("id", formName);
    form.attr(`data-${formName}`);

    formGroup.addClass("form-group");
    formGroup.attr("id", `${formName}-formGroup`);

    inputLabel.attr("id", `${formName}-inputLabel`);
    inputLabel.attr("for", `${formName}-input`);
    inputLabel.text(`${labelString}`);

    input.addClass("form-control");
    input.attr("id", `${formName}-input`);
    input.attr("type", `${inputType}`);
    input.attr("placeholder", `${placeholderString}`);

    alert.addClass("alert alert-danger");
    alert.attr("id", `${formName}-alert`);
    alert.attr("style", "display:none");
    alert.attr("role", "alert");

    alertGlyph.addClass("glyphicon glyphicon-exclamation-sign");
    alertGlyph.attr("id", `${formName}-alertGlyph`);
    alertGlyph.attr("aria-hidden", "true");

    alertError.addClass("sr-only");
    alertError.attr("id", `${formName}-alertError`);

    alertMessage.addClass("msg");
    alertMessage.attr("id", `${formName}-alertMessage`);

    button.addClass("btn btn-default");
    button.attr("id", `${formName}-button`);
    button.attr("type", "submit");
    button.text(`${buttonString}`);

    //  Appendages
    alert.append(alertGlyph);
    alert.append(alertError);
    alert.append(alertMessage);

    formGroup.append(inputLabel);
    formGroup.append(input);

    form.append(formGroup);
    form.append(alert);
    form.append(button);

    //  give same dataAttribute to all elements in the form
    $(`.${formName}`).attr(`data-${formName}`, `${formName}`);
    return form;
  }

  //  Object is designed for use as arguments for function createForm
  const accountSearchFormData = {
    formName: "accountSearch",
    labelString: "Email address",
    placeholderString: "Email",
    inputType: "email",
    buttonString: "Recover Password"
  };
  const recoveryAnswerFormData = {
    formName: "recoveryAnswer",
    labelString: "",
    placeholderString: "Your Answer",
    inputType: "password",
    buttonString: "Submit Answer"
  };
  const newPasswordFormData = {
    formName: "newPassword",
    labelString: "Enter new password",
    placeholderString: "New password",
    inputType: "password",
    buttonString: "Reset Password"
  };
  const passwordConfirmFormData = {
    formName: "passwordConfirm",
    labelString: "Re-enter new password.",
    placeholderString: "Confirm new password",
    inputType: "password",
    buttonString: "Reset Password"
  };

  //  Create forms
  const accountSearchFormElement = createForm(
    ...Object.values(accountSearchFormData)
  );
  const recoveryAnswerFormElement = createForm(
    ...Object.values(recoveryAnswerFormData)
  );
  const newPasswordFormElement = createForm(
    ...Object.values(newPasswordFormData)
  );
  const passwordConfirmFormElement = createForm(
    ...Object.values(passwordConfirmFormData)
  );

  mother.append(accountSearchFormElement);

  //  Add listers to the forms
  accountSearchFormElement.on("submit", (event) => {
    event.preventDefault();
    $(".alert").hide();
    const searchForThisEmail = $("#accountSearch-input").val();
    //  Send email to backend.
    $.post("/api/passwordRecovery/accountSearch", {
      email: searchForThisEmail
    })
      .then((recoveryQuestion) => {
        //  "Turn off" the old form
        $("form.accountSearch button").hide();
        $("#accountSearch-input").attr("readonly", "true");
        //  The next two lines must be in this order or the
        //  recoveryQuestion will not appear in the input label.
        mother.append(recoveryAnswerFormElement);
        $("#recoveryAnswer-inputLabel").text(recoveryQuestion);
      })
      .catch(handleError);
  });

  recoveryAnswerFormElement.on("submit", (event) => {
    event.preventDefault();
    $(".alert").hide();
    const answerSubmission = $("#recoveryAnswer-input").val().trim();
    $.post("/api/passwordRecovery/matchAnswer", {
      email: $("#accountSearch-input").val(),
      recoveryAnswer: answerSubmission
    })
      .then((answerMatch) => {
        if (answerMatch) {
          $("#recoveryAnswer-button").hide();
          $("#recoveryAnswer-input").attr("readonly", "true");
          newPasswordFormElement.appendTo(mother);
        }
      })
      .catch(handleError);
  });

  newPasswordFormElement.on("submit", (event) => {
    event.preventDefault();
    $(".alert").hide();
    $.post("/api/passwordRecovery/testPasswordRequirements", {
      potentialPassword: $("#newPassword-input").val().trim()
    })
      .then((passwordIsValid) => {
        console.log("inside .then 166, passwordIsValid = ", passwordIsValid);
        if (passwordIsValid) {
          $("#newPassword-button").hide();
          $("#newPassword-input").attr("readonly", "true");
          passwordConfirmFormElement.appendTo(mother);
        }
      })
      .catch(handleError);
    console.log("inside submit event");
  });

  passwordConfirmFormElement.on("submit", (event) => {
    event.preventDefault();
    $(".alert").hide();
    const firstPasswordInputText = $("#newPassword-input").val();
    const secondPasswordInputText = $("#passwordConfirm-input").val();
    $.ajax({
      url: "/api/passwordRecovery/confirmPassword",
      method: "PUT",
      data: {
        email: $("#accountSearch input").val(),
        password1: firstPasswordInputText,
        password2: secondPasswordInputText
      }
    })
      .then((result) => {
        //Password is now update.  What do?  redirect to login
        $("#passwordConfirm-alertMessage").text("Success!  Password Updated");
        $("#passwordConfirm-alert")
          .removeClass("alert-danger")
          .addClass("alert-success")
          .fadeIn(500);
        passwordConfirmFormElement.off();
        $("#passwordConfirm-button")
          .text("Login")
          .click((event) => {
            event.preventDefault();
            window.location.href = "/login";
          });
      })
      .catch(handleError);
  });

  function handleError(err) {
    const alertIdSnippet = null || err.responseJSON.class;
    const alertMessage = null || err.responseJSON.msg;
    $(`#${alertIdSnippet}-alertMessage`).text(`${alertMessage}`);
    $(`#${err.responseJSON.class}-alert`).fadeIn(500);
  }
});
