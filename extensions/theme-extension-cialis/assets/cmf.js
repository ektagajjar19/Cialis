const deskUrl = "https://clialis.project-progress.net";

// Function to transform preferences into metafields
function transformToPreferencesMetafields(preferences) {
    return [
        {
            namespace: "custom",
            key: "email_preference",
            value: preferences.email,
            type: "boolean",
        },
        {
            namespace: "custom",
            key: "phone_preferences",
            value: preferences.phone,
            type: "boolean",
        },
        {
            namespace: "custom",
            key: "sms_preferences",
            value: preferences.sms,
            type: "boolean",
        },
        {
            namespace: "custom",
            key: "post_preferences",
            value: preferences.post,
            type: "boolean",
        },
    ];
}

// Function to transform form data into metafields for MyDetails
function transformToMyDetailsMetafields(formData) {
    if(formData.birthDate.length < 2){
        formData.birthDate= "0"+ formData.birthDate   }
    if(formData.birthMonth.length<2){
        formData.birthMonth= "0"+ formData.birthMonth }
    const dateOfBirth = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDate}`;
    console.log(dateOfBirth);
    return [
        {
            namespace: "custom",
            key: "date_of_birth",
            value: dateOfBirth,
            type: "date",
        },
        {
            namespace: "details",
            key: "gender",
            value: formData.gender,
            type: "single_line_text_field",
        },
        {
            namespace: "details",
            key: "telephone",
            value: formData.telephone,
            type: "single_line_text_field",
        },
        {
            namespace: "details",
            key: "title",
            value: formData.title,
            type: "single_line_text_field",
        },
    ];
}

// Function to fetch customerId
const fetchCustomerId = async () => {
    const form = document.getElementById("userDetailsForm");
    if (!form) return null;
    const userId = form.querySelector('input[name="userId"]').value;
    return "gid://shopify/Customer/" + userId;
};

// Function to update customer details and metafields for preferences
async function updatePreferences(customerId, metafields, shopName, formName) {
    try {
        const response = await fetch(deskUrl + "/api/update-metafields", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                customerId,
                metafields,
                shopName,
                formName,
            }),
        });

        const result = await response.json();
        if (response.ok) {
            const successMsg = document.getElementById(
                "savePreferencesSuccess",
            );
            if (successMsg) {
                successMsg.style.display = "block";
                setTimeout(() => {
                    successMsg.style.display = "none";
                }, 3000);
            } else {
                console.error("Success message element not found");
            }
        } else {
            console.error("Failed to update preferences:", result.errors);
        }
    } catch (error) {
        console.error("Error updating preferences:", error);
    }
}

// Function to update customer details and metafields for myDetails
async function updateMyDetails(
    customerId,
    firstName,
    lastName,
    metafields,
    shopName,
    formName,
) {
    try {
        const response = await fetch(deskUrl + "/api/update-mydetails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                customerId,
                firstName,
                lastName,
                metafields,
                shopName,
                formName,
            }),
        });

        const result = await response.json();
        if (response.ok) {
            const successMsg = document.getElementById(
                "submitMyDetailsSuccess",
            );
            if (successMsg) {
                successMsg.style.display = "block";
                setTimeout(() => {
                    successMsg.style.display = "none";
                }, 3000);
            } else {
                console.error("Success message element not found");
            }
        } else {
            alert(result.errors[0]);
        }
    } catch (error) {
        console.error("Error updating myDetails:", error);
    }
}

// Function to set email preferences on page load
async function updatePreferencesOnLoad() {
    const customerId = await fetchCustomerId();
    if (!customerId) return;
    const preferences = getCheckboxValues();
    const metafields = transformToPreferencesMetafields(preferences);
    const shopName = Shopify.shop;
    try {
        const response = await fetch(deskUrl + "/api/set-email-preference", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ customerId, shopName }),
        });

        const result = await response.json();
        if (response.ok) {
            console.log("Email preference set successfully on page load");
        } else {
            console.error("Failed to set email preference:", result.errors);
        }
    } catch (error) {
        console.error("Error setting email preference:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    updatePreferencesOnLoad();

    document.querySelectorAll(".preferences").forEach((checkbox) => {
        checkbox.addEventListener("change", async function () {
            const customerId = await fetchCustomerId();
            const shopName = Shopify.shop;
            const key = this.getAttribute("data-metafield");
            const value = this.checked ? "true" : "false";
            const metafield = {
                namespace: "custom",
                key: key,
                value: value,
                type: "boolean",
            };
            console.log("Metafield:", metafield);

            const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = csrfTokenMeta ? csrfTokenMeta.getAttribute("content"): "";
            if (!csrfToken) {
                console.error("CSRF token not found.");
                return;
            }

            try {
                const response = await fetch(deskUrl + "/api/update-metafields", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify({
                        customerId: customerId,
                        metafield: metafield,
                        shopName: shopName,
                        action: "reorder",
                    }),
                });
                const result = await response.json();
                console.log("Result:", result);

                if (response.ok) {
                    const successMsg = document.getElementById("savePreferencesSuccess");
                    if (successMsg) {
                        successMsg.style.display = "block";
                        setTimeout(() => {
                            successMsg.style.display = "none";
                        }, 3000);
                    } else {
                        console.error("Success message element not found");
                    }
                } else {
                    console.error("Failed to update preferences:", result.errors);
                    alert("To update Email Preference Status, First you need to fill My Details form with correct mobile number.");
                }
            } catch (error) {
                console.error("Error updating preferences:", error);
            }
        });
    });

    document.getElementById("submitMyDetails").addEventListener("click",async function (event) {
            event.preventDefault()
            const birthDate = document.getElementById("birthDate");
            const birthMonth = document.getElementById("birthMonth");
            const birthYear = document.getElementById("birthYear");
            const errorMessage = document.getElementById("birthdateError");
            const submitButton = document.getElementById("submitMyDetails");

            const validateDay = (input) => {
                const value = input.value;
                if (value.length > 2) {
                    input.value = value.slice(0, 2);
                }
                if (value < 1 || value > 31) {
                    errorMessage.textContent =
                        "Please enter a valid day (01 to 31).";
                    return false;
                } else {
                    errorMessage.textContent = "";
                    return true;
                }
            };
            const validateMonth = (input) => {
                const value = input.value;
                if (value.length > 2) {
                    input.value = value.slice(0, 2);
                }
                if (value < 1 || value > 12) {
                    errorMessage.textContent =
                        "Please enter a valid month (01 to 12).";
                    return false;
                } else {
                    errorMessage.textContent = "";
                    return true;
                }
            };
            const validateYear = (input) => {
                const value = input.value;
                const currentYear = new Date().getFullYear();
                if (value.length > 4) {
                    input.value = value.slice(0, 4);
                }

                if (value < 1900 || value > currentYear) {
                    errorMessage.textContent = `Please enter a valid year (1900 to ${currentYear}).`;
                    return false;
                } else {
                    errorMessage.textContent = "";
                    return true;
                }
            };
            if (birthDate) {
                birthDate.addEventListener("input", (event) =>
                    validateDay(event.target),
                );
            }
            console.log("birthMonth :", birthMonth);
            if (birthMonth) {
                birthMonth.addEventListener("input", (event) =>
                    validateMonth(event.target),
                );
            }
            if (birthYear) {
                birthYear.addEventListener("input", (event) =>
                    validateYear(event.target),
                );
            }

            const isValidPhoneNumber = (phoneNumber) => {
                return /^\d{11}$/.test(phoneNumber);
            };

            const isValidDateOfBirth = (day, month, year) => {
                    if(day.length < 2){
                        day= "0"+ day   }
                    if(month.length<2){
                        month= "0"+ month
                    }
                if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear() ) {
                    return false;
                }
                return true;
            };
                    var isValid = true;
                    var errorMessages =
                        document.getElementsByClassName("error-message");
                    for (var i = 0; i < errorMessages.length; i++) {
                        errorMessages[i].textContent = "";
                    }
                    // First name validation
                    var firstNameInput = document.getElementById("firstName");
                    if (firstNameInput.value.trim() === "") {
                        document.getElementById("firstNameError").textContent =
                            "First name is required";
                        isValid = false;
                    }
                    // Last name validation
                    var lastNameInput = document.getElementById("lastName");
                    if (lastNameInput.value.trim() === "") {
                        document.getElementById("lastNameError").textContent =
                            "Last name is required";
                        isValid = false;
                    }
                    // Telephone validation (optional)
                    var numberInput = document.getElementById("numberMyDetails");
                    var phoneNumber = numberInput.value.trim();
                    if (phoneNumber == "" && !isValidPhoneNumber(phoneNumber)) {
                        document.getElementById("numberError").textContent =
                            "Please enter a valid 10/11-digit phone number";
                        isValid = false;
                    }
                    // Birthdate validation
                    let birthDateTrim = birthDate.value.trim();
                    let birthMonthTrim = birthMonth.value.trim();
                    let birthYearTrim = birthYear.value.trim();
                    if (birthDateTrim == "" || birthMonthTrim == "" || birthYearTrim == "") {
                            document.getElementById("birthdateError").textContent =
                                "Please enter a valid date of birth (DD-MM-YYYY)";
                            isValid = false;
                    } else {
                        let date = parseInt(birthDateTrim, 10);
                        let month = parseInt(birthMonthTrim, 10);
                        let year = parseInt(birthYearTrim, 10);
                        if (date < 1 || date > 31) {
                            document.getElementById("birthdateError").textContent =
                                "Please enter a valid day (01 to 31).";
                            isValid = false;
                        } else if (month < 1 || month > 12) {
                            document.getElementById("birthdateError").textContent =
                                "Please enter a valid month (01 to 12).";
                            isValid = false;
                        } else if (year < 1900 || year > 2024) {
                            document.getElementById("birthdateError").textContent =
                                "Please enter a valid year (1900 to 2024).";
                            isValid = false;
                        } else {
                            let daysInMonth = new Date(year, month, 0).getDate();
                            if (date > daysInMonth) {
                                document.getElementById("birthdateError").textContent =
                                    "The day does not match the month/year combination.";
                                isValid = false;
                            }
                        }
                    }
                    // Gender validation (optional)
                    var genderInputs = document.getElementsByName("gender");
                    var genderSelected = false;
                    for (var j = 0; j < genderInputs.length; j++) {
                        if (genderInputs[j].checked) {
                            genderSelected = true;
                            break;
                        }
                    }
                    if (!genderSelected) {
                        document.getElementById("genderRadioError").textContent =
                            "Please select a gender";
                        isValid = false;
                    }
                    if(document.getElementById("gender").value == "null"){
                        document.getElementById("Title-gender").textContent =
                        "Please select a Prefix Title.";
                        isValid = false;
                    }
                    if (!isValid) {
                        return false;
                    }
                    if (isValid) {
                        const customerId = await fetchCustomerId();
                        const firstName = document.getElementById("firstName").value;
                        const lastName = document.getElementById("lastName").value;
                        const formData = {
                            firstName: document.getElementById("firstName").value,
                            lastName: document.getElementById("lastName").value,
                            title: document.getElementById("gender").value,
                            email: document.getElementById("emailMyDetails").value,
                            telephone: document.getElementById("numberMyDetails").value,
                            birthDate: document.getElementById("birthDate").value,
                            birthMonth: document.getElementById("birthMonth").value,
                            birthYear: document.getElementById("birthYear").value,
                            gender: getSelectedGender(),
                        };
                        const metafields = transformToMyDetailsMetafields(formData);
                        const shopName = Shopify.shop;
                        updateMyDetails( customerId, firstName, lastName, metafields, shopName, "formName");
                    }
    });
});

function getSelectedGender() {
    const genderOptions = document.getElementsByName("gender");
    for (let i = 0; i < genderOptions.length; i++) {
        if (genderOptions[i].checked) {
            return genderOptions[i].value;
        }
    }
    return null;
}

function getCheckboxValues() {
    const email = document.getElementById("email").checked.toString();
    const phone = document.getElementById("phone").checked.toString();
    const sms = document.getElementById("sms").checked.toString();
    const post = document.getElementById("post").checked.toString();
    return { email, phone, sms, post };
}

function isValidPhoneNumber(number) {
    var numberRegex = /^\d{10}$/;
    if(number == null){
    number = +447464736755;
    }
    return numberRegex.test(number);
}

function isValidDateOfBirth(day, month, year) {
    isValid = true;
    if(day.length < 2){
         day= "0"+ day   }
    if(month.length<2){
        month= "0"+ month
    }
    var dayInt = parseInt(day, 10);
    if (!(dayInt >= 1 && dayInt <= 31)) {
        isValid = false;
    }
    var monthInt = parseInt(month, 10);
    if (!(monthInt >= 1 && monthInt <= 12)) {
        isValid = false;
    }
    if (year >= 1900 && monthInt <=new Date().getFullYear()) {
        isValid = false;
    }
    return isValid;
}

