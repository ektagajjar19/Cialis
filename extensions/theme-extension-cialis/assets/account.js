const apiUrl = "https://clialis.project-progress.net/api/get-qn-data";
const csrfToken = "mycsrf";
var div = "";
var a1_self = "";
async function getShopDetails(shopName) {
    try {
        const requestData = {
            shop_name: shopName,
            customer_id: customerId,
        };

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch details");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching details:", error.message);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    if (window.location.href.includes("/account")) {
        const shopName = Shopify.shop;
        const customerId = window.customerId;

        if (customerId) {
            getShopDetails(shopName)
                .then((data) => {
                    if (data) {
                        const targetElement =
                            document.querySelector("#hideIfDataNull");
                        if (targetElement) {
                            const observer = new MutationObserver(
                                (mutationsList) => {
                                    for (const mutation of mutationsList) {
                                        if (mutation.type === "childList") {
                                            document
                                                .querySelectorAll(
                                                    ".main-question",
                                                )
                                                .forEach((d) => {
                                                    d.childNodes.forEach(
                                                        (e) => {
                                                            if (
                                                                e.nodeType ===
                                                                    Node.ELEMENT_NODE &&
                                                                e.tagName ===
                                                                    "DIV"
                                                            ) {
                                                                e.childNodes.forEach(
                                                                    (
                                                                        inner_p,
                                                                    ) => {
                                                                        if (
                                                                            inner_p.nodeType ===
                                                                            Node.ELEMENT_NODE
                                                                        ) {
                                                                            inner_p.classList.add(
                                                                                "account-subtitle",
                                                                            );
                                                                            observer.disconnect();
                                                                        }
                                                                    },
                                                                );
                                                            } else {
                                                                if (
                                                                    e.nodeType ===
                                                                    Node.ELEMENT_NODE
                                                                ) {
                                                                    e.classList.add(
                                                                        "account-subtitle",
                                                                    );
                                                                }
                                                            }
                                                        },
                                                    );
                                                });
                                        }
                                    }
                                },
                            );

                            const config = {
                                childList: true,
                                subtree: true,
                                characterData: true,
                                attributes: false,
                            };

                            observer.observe(targetElement, config);
                        } else {
                            console.log(
                                'Element with id "hideIfDataNull" not found.',
                            );
                        }

                        console.log(data);
                        if (data.a_1) {
                            const container = document.createElement("div");
                            container.className = "question-container";

                            const titleElement = document.createElement("div");
                            titleElement.innerHTML = data.a_1.title;
                            container.appendChild(titleElement);
                            data.a_1.answers.forEach((answer) => {
                                const item = document.createElement("div");
                                item.className = "account-content-item";

                                const span = document.createElement("span");
                                span.className = "item-chechbox";
                                if (answer.is_correct) {
                                    span.classList.add("checked");
                                }

                                const label = document.createElement("label");
                                label.htmlFor = `answer-${answer.value}`;
                                label.className = "item-chechbox-label";
                                label.textContent = answer.text;

                                item.appendChild(span);
                                item.appendChild(label);

                                container.appendChild(item);
                            });
                            const a_1Div = document.getElementById("a_1");
                            if (a_1Div) {
                                a_1Div.appendChild(container);
                            }
                        }

                        if (data.a_1_a) {
                            if (data.a_1_a.answers[0].is_correct) {
                                const container = document.createElement("div");
                                container.className = "question-container";

                                const titleElement =
                                    document.createElement("div");
                                titleElement.innerHTML = data.a_1_a.title;
                                container.appendChild(titleElement);
                                if (data.a_1_a.desc) {
                                    const descElement =
                                        document.createElement("div");
                                    descElement.innerHTML = data.a_1_a.desc;
                                    container.appendChild(descElement);
                                }

                                data.a_1_a.answers.forEach((answer) => {
                                    const item = document.createElement("div");
                                    item.className = "account-content-item";

                                    const span = document.createElement("span");
                                    span.className = "item-chechbox";
                                    if (answer.is_correct) {
                                        span.classList.add("checked");
                                    }

                                    const label =
                                        document.createElement("label");
                                    label.htmlFor = `answer-${answer.value}`;
                                    label.className = "item-chechbox-label";
                                    label.textContent = answer.text;

                                    item.appendChild(span);
                                    item.appendChild(label);

                                    container.appendChild(item);
                                });

                                const a1aDiv = document.getElementById("a_1_a");
                                if (a1aDiv) {
                                    a1aDiv.appendChild(container);
                                }
                            }
                        }
                        if (data.a_1_b) {
                            const container = document.createElement("div");
                            container.className = "question-container";
                            const titleElement = document.createElement("div");
                            titleElement.innerHTML = data.a_1_b.title;
                            container.appendChild(titleElement);
                            let a1_someone = data.a_1.answers.filter(
                                (answer) => answer.is_correct == true,
                            );
                            let text_t =
                                "I am making the request to purchase Cialis Together on behalf of someone else.";
                            if (
                                a1_someone[0].text.toLowerCase() ==
                                text_t.toLowerCase()
                            ) {
                                if (a1_someone) {
                                    if (data.a_1_b.desc) {
                                        const descElement =
                                            document.createElement("div");
                                        descElement.innerHTML = data.a_1_b.desc;
                                        container.appendChild(descElement);
                                    }
                                }
                            }
                            a1_self = data.a_1.answers.filter(
                                (answer) => answer.is_correct == true,
                            );
                            let text_s =
                                "I am requesting to purchase Cialis Together for myself.";
                            if (
                                a1_self[0].text.toLowerCase() ==
                                text_s.toLowerCase()
                            ) {
                                if (a1_self) {
                                    console.log("data not found");
                                    div = document.createElement("div");
                                    div.className = "main-description";
                                    const ul = document.createElement("ul");
                                    ul.className = "main-description--list";
                                    const content = [
                                        "This request to purchase Cialis® Together is for me.",
                                        "I have read the patient information leaflet.",
                                        "I am 18 years old or over.",
                                        "I am male.",
                                        "I am resident in the United Kingdom (England, Wales and Scotland) but not Northern Ireland (where this product is not currently available for pharmacy sale).",
                                        "I have erectile dysfunction.",
                                    ];
                                    content.forEach((text) => {
                                        const li = document.createElement("li");
                                        li.style.listStyle = "none";
                                        li.innerHTML = `<span class="item-chechbox checked"></span> ${text}`;
                                        ul.appendChild(li);
                                    });
                                    div.appendChild(ul);
                                }
                            }

                            data.a_1_b.answers.forEach((answer) => {
                                const item = document.createElement("div");
                                item.className = "account-content-item";

                                const span = document.createElement("span");
                                span.className = "item-chechbox";
                                if (answer.is_correct) {
                                    span.classList.add("checked");
                                }

                                const label = document.createElement("label");
                                label.htmlFor = `answer-${answer.value}`;
                                label.className = "item-chechbox-label";
                                label.textContent = answer.text;

                                item.appendChild(span);
                                item.appendChild(label);

                                container.appendChild(item);
                            });

                            const a1bDiv = document.getElementById("a_1_b");
                            if (a1bDiv) {
                                a1bDiv.appendChild(container);
                            }
                        }

                        if (data.a_1_b_3) {
                            const container = document.createElement("div");
                            container.className = "question-container";

                            const titleElement = document.createElement("div");
                            titleElement.innerHTML = data.a_1_b_3.title;
                            container.appendChild(titleElement);

                            const descElement = document.createElement("div");
                            descElement.innerHTML = data.a_1_b_3.desc;
                            container.appendChild(descElement);

                            data.a_1_b_3.answers.forEach((answer) => {
                                const item = document.createElement("div");
                                item.className = "account-content-item";

                                const span = document.createElement("span");
                                span.className = "item-chechbox";
                                if (answer.is_correct) {
                                    span.classList.add("checked");
                                }

                                const label = document.createElement("label");
                                label.htmlFor = `answer-${answer.value}`;
                                label.className = "item-chechbox-label";
                                label.textContent = answer.text;

                                item.appendChild(span);
                                item.appendChild(label);

                                container.appendChild(item);
                            });

                            const pharmacyDiv =
                                document.getElementById("a_1_b_3");
                            if (pharmacyDiv) {
                                pharmacyDiv.appendChild(container);
                            }
                        }

                        if (data.a_1_b_4) {
                            if (data.a_1_b_4.answers[0].is_correct) {
                                const container = document.createElement("div");
                                container.className = "question-container";

                                const titleElement =
                                    document.createElement("div");
                                titleElement.innerHTML =
                                    "<article>" +
                                    data.a_1_b_4.title +
                                    "</article>";
                                container.appendChild(titleElement);

                                const descElement =
                                    document.createElement("div");
                                descElement.innerHTML = data.a_1_b_4.desc;
                                container.appendChild(descElement);

                                data.a_1_b_4.answers.forEach((answer) => {
                                    const item = document.createElement("div");
                                    item.className = "account-content-item";

                                    const span = document.createElement("span");
                                    span.className = "item-chechbox";
                                    if (answer.is_correct) {
                                        span.classList.add("checked");
                                    }

                                    const label =
                                        document.createElement("label");
                                    label.htmlFor = `answer-${answer.value}`;
                                    label.className = "item-chechbox-label";
                                    label.textContent = answer.text;

                                    item.appendChild(span);
                                    item.appendChild(label);

                                    container.appendChild(item);
                                });
                                const IorUDiv =
                                    document.getElementById("a_1_b_4");
                                if (IorUDiv) {
                                    IorUDiv.appendChild(container);
                                }
                            }
                        }

                        if (data.a_1_b_2) {
                            const userName = data.a_1_b_2.name;
                            const userPhone = data.a_1_b_2.phone;
                            const endUserDetails =
                                document.getElementsByClassName(
                                    "end-user-details",
                                );
                            if (userName && userPhone) {
                                const usernameElements =
                                    document.getElementsByClassName(
                                        "medical_username",
                                    );
                                const phoneElements =
                                    document.getElementsByClassName(
                                        "medical_phoneno",
                                    );
                                if (usernameElements.length > 0) {
                                    usernameElements[0].innerHTML = userName;
                                }
                                if (phoneElements.length > 0) {
                                    phoneElements[0].innerHTML = userPhone;
                                }
                            } else {
                                if (endUserDetails.length > 0) {
                                    endUserDetails[0].style.display = "none";
                                }
                            }
                        }

                        if (data.a_2) {
                            var answer = "";
                            const container = document.createElement("div");
                            container.className = "account-content";

                            const titleElement = document.createElement("div");
                            titleElement.innerHTML = data.a_2.title;
                            titleElement.className = "account-subtitle-ctn";
                            container.appendChild(titleElement);

                            var answera2 = data.a_2.answers.filter(
                                (answer) => answer.is_correct == true,
                            );
                            if (answera2[0]) {
                                var item = document.createElement("div");
                                item.className = "account-content-toggle";

                                var checkbox = document.createElement("input");
                                checkbox.type = "checkbox";
                                checkbox.className = "checkbox-tick";

                                checkbox.id = `answer-${answera2[0].value}`;
                                checkbox.disabled = true;
                                if (answera2[0].text.toLowerCase() == "yes") {
                                    checkbox.checked = answera2[0].is_correct;
                                }
                                const label = document.createElement("label");
                                label.htmlFor = `answer-${answera2[0].value}`;
                                label.className = "item-chechbox-label";
                                label.innerHTML =
                                    '<div class="toggle-icon-on toggle-icon"><img class="toogle-button" src="//shop-uk.cialistogether.com/cdn/shop/t/22/assets/yes-toggle-button.svg?v=45665156451938296241719327512" width="80" height="40" alt="toogle button"></div><div class="toggle-icon-of toggle-icon"><img class="toogle-button" src="//shop-uk.cialistogether.com/cdn/shop/t/22/assets/no-toggle-button.svg?v=32838907917297757371719327511" width="80" height="40" alt="toogle button"></div>';
                                item.appendChild(checkbox);
                                item.appendChild(label);
                                container.appendChild(item);
                            } else {
                                var answeroptiona2 = data.a_2.answers.filter(
                                    (answer) => answer.is_correct == false,
                                );
                                if (answeroptiona2[0]) {
                                    var item = document.createElement("div");
                                    item.className = "account-content-toggle";

                                    var checkbox =
                                        document.createElement("input");
                                    checkbox.type = "checkbox";
                                    checkbox.className = "checkbox-tick";
                                    checkbox.id = `answer-${answeroptiona2[0].value}`;
                                    checkbox.disabled = true;
                                    const label =
                                        document.createElement("label");
                                    label.htmlFor = `answer-${answeroptiona2[0].value}`;
                                    label.className = "item-chechbox-label";
                                    label.innerHTML =
                                        '<div class="toggle-icon-on toggle-icon"><img class="toogle-button" src="//shop-uk.cialistogether.com/cdn/shop/t/22/assets/yes-toggle-button.svg?v=45665156451938296241719327512" width="80" height="40" alt="toogle button"></div><div class="toggle-icon-of toggle-icon"><img class="toogle-button" src="//shop-uk.cialistogether.com/cdn/shop/t/22/assets/no-toggle-button.svg?v=32838907917297757371719327511" width="80" height="40" alt="toogle button"></div>';

                                    item.appendChild(checkbox);
                                    item.appendChild(label);
                                    container.appendChild(item);
                                }
                            }
                            const a2Div = document.getElementById("a_2");
                            if (a2Div) {
                                a2Div.appendChild(container);
                            }
                        }

                        if (data.a_3) {
                            let a2 = data.a_2.answers.filter(
                                (answer) => answer.is_correct == true,
                            );
                            if (a2[0].text.toLowerCase() == "no") {
                                const container = document.createElement("div");
                                container.className = "account-content";

                                const titleElement =
                                    document.createElement("div");
                                titleElement.className = "account-subtitle-ctn";
                                titleElement.innerHTML = data.a_3.title;
                                container.appendChild(titleElement);

                                var answera3 = data.a_3.answers.filter(
                                    (answer) => answer.is_correct == true,
                                );
                                if (answera3[0]) {
                                    var item = document.createElement("div");
                                    item.className = "account-content-toggle";

                                    var checkbox =
                                        document.createElement("input");
                                    checkbox.type = "checkbox";
                                    checkbox.className = "checkbox-tick";

                                    checkbox.id = `answer-${answera3[0].value}`;
                                    checkbox.disabled = true;
                                    if (
                                        answera3[0].text.toLowerCase() == "yes"
                                    ) {
                                        checkbox.checked =
                                            answera3[0].is_correct;
                                    }
                                    const label =
                                        document.createElement("label");
                                    label.htmlFor = `answer-${answera3[0].value}`;
                                    label.className = "item-chechbox-label";
                                    label.innerHTML =
                                        '<div class="toggle-icon-on toggle-icon"><img class="toogle-button" src="//shop-uk.cialistogether.com/cdn/shop/t/22/assets/yes-toggle-button.svg?v=45665156451938296241719327512" width="80" height="40" alt="toogle button"></div><div class="toggle-icon-of toggle-icon"><img class="toogle-button" src="//shop-uk.cialistogether.com/cdn/shop/t/22/assets/no-toggle-button.svg?v=32838907917297757371719327511" width="80" height="40" alt="toogle button"></div>';

                                    item.appendChild(checkbox);
                                    item.appendChild(label);
                                    container.appendChild(item);
                                } else {
                                    var answeroptiona3 =
                                        data.a_3.answers.filter(
                                            (answer) =>
                                                answer.is_correct == false,
                                        );
                                    if (answeroptiona3[0]) {
                                        var item =
                                            document.createElement("div");
                                        item.className =
                                            "account-content-toggle";

                                        var checkbox =
                                            document.createElement("input");
                                        checkbox.type = "checkbox";
                                        checkbox.className = "checkbox-tick";

                                        checkbox.id = `answer-${answeroptiona3[0].value}`;
                                        checkbox.disabled = true;
                                        const label =
                                            document.createElement("label");
                                        label.htmlFor = `answer-${answeroptiona3[0].value}`;
                                        label.className = "item-chechbox-label";
                                        label.innerHTML =
                                            '<div class="toggle-icon-on toggle-icon"><img class="toogle-button" src="//shop-uk.cialistogether.com/cdn/shop/t/22/assets/yes-toggle-button.svg?v=45665156451938296241719327512" width="80" height="40" alt="toogle button"></div><div class="toggle-icon-of toggle-icon"><img class="toogle-button" src="//shop-uk.cialistogether.com/cdn/shop/t/22/assets/no-toggle-button.svg?v=32838907917297757371719327511" width="80" height="40" alt="toogle button"></div>';

                                        item.appendChild(checkbox);
                                        item.appendChild(label);
                                        container.appendChild(item);
                                    }
                                }
                                const a3Div = document.getElementById("a_3");
                                if (a3Div) {
                                    a3Div.appendChild(container);
                                }
                            }
                        }

                        if (data.a_4) {
                            const container = document.createElement("div");
                            container.className = "account-content";
                            const titleElement = document.createElement("div");
                            titleElement.className = "account-subtitle-ctn";
                            titleElement.innerHTML = data.a_4.title;
                            container.appendChild(titleElement);

                            var answera4 = data.a_4.answers.filter(
                                (answer) => answer.is_correct == true,
                            );
                            if (answera4[0]) {
                                var item = document.createElement("div");
                                item.className = "account-content-toggle";

                                var checkbox = document.createElement("input");
                                checkbox.type = "checkbox";
                                checkbox.className = "checkbox-tick";

                                checkbox.id = `answer-${answera4[0].value}`;
                                checkbox.disabled = true;
                                if (answera4[0].text.toLowerCase() == "yes") {
                                    checkbox.checked = answera4[0].is_correct;
                                }
                                const label = document.createElement("label");
                                label.htmlFor = `answer-${answera4[0].value}`;
                                label.className = "item-chechbox-label";
                                label.innerHTML =
                                    '<div class="toggle-icon-on toggle-icon"><img class="toogle-button" src="//shop-uk.cialistogether.com/cdn/shop/t/22/assets/yes-toggle-button.svg?v=45665156451938296241719327512" width="80" height="40" alt="toogle button"></div><div class="toggle-icon-of toggle-icon"><img class="toogle-button" src="//shop-uk.cialistogether.com/cdn/shop/t/22/assets/no-toggle-button.svg?v=32838907917297757371719327511" width="80" height="40" alt="toogle button"></div>';

                                item.appendChild(checkbox);
                                item.appendChild(label);
                                container.appendChild(item);
                            } else {
                                var answeroptiona4 = data.a_4.answers.filter(
                                    (answer) => answer.is_correct == false,
                                );
                                if (answeroptiona4[0]) {
                                    var item = document.createElement("div");
                                    item.className = "account-content-toggle";

                                    var checkbox =
                                        document.createElement("input");
                                    checkbox.type = "checkbox";
                                    checkbox.className = "checkbox-tick";

                                    checkbox.id = `answer-${answeroptiona4[0].value}`;
                                    checkbox.disabled = true;
                                    const label =
                                        document.createElement("label");
                                    label.htmlFor = `answer-${answeroptiona4[0].value}`;
                                    label.className = "item-chechbox-label";
                                    label.innerHTML =
                                        '<div class="toggle-icon-on toggle-icon"><img class="toogle-button" src="//shop-uk.cialistogether.com/cdn/shop/t/22/assets/yes-toggle-button.svg?v=45665156451938296241719327512" width="80" height="40" alt="toogle button"></div><div class="toggle-icon-of toggle-icon"><img class="toogle-button" src="//shop-uk.cialistogether.com/cdn/shop/t/22/assets/no-toggle-button.svg?v=32838907917297757371719327511" width="80" height="40" alt="toogle button"></div>';

                                    item.appendChild(checkbox);
                                    item.appendChild(label);
                                    container.appendChild(item);
                                }
                            }
                            const a4Div = document.getElementById("a_4");
                            if (a4Div) {
                                a4Div.appendChild(container);
                            }
                        }

                        if (data.a_5) {
                            const container = document.createElement("div");
                            container.className = "question-container";

                            const titleElement = document.createElement("div");
                            titleElement.innerHTML = data.a_5.title;
                            container.appendChild(titleElement);

                            data.a_5.answers.forEach((answer) => {
                                const item = document.createElement("div");
                                item.className = "account-content-item";

                                const checkbox =
                                    document.createElement("input");
                                checkbox.type = "checkbox";
                                checkbox.id = `answer-${answer.value}`;
                                checkbox.disabled = true;
                                checkbox.checked = answer.is_correct;

                                const span = document.createElement("span");
                                span.className = "item-chechbox";
                                if (answer.is_correct) {
                                    span.classList.add("checked");
                                }
                                const label = document.createElement("label");
                                label.htmlFor = checkbox.id;
                                label.className = "item-chechbox-label";
                                label.innerHTML = answer.text;

                                item.appendChild(span);
                                item.appendChild(label);

                                container.appendChild(item);
                            });

                            const a5Div = document.getElementById("a_5");
                            if (a5Div) {
                                a5Div.appendChild(container);
                            }
                        }

                        if (data.a_6) {
                            const container = document.createElement("div");
                            container.className = "question-container";

                            const titleElement = document.createElement("div");
                            titleElement.innerHTML = data.a_6.title;
                            container.appendChild(titleElement);

                            data.a_6.answers.forEach((answer) => {
                                const item = document.createElement("div");
                                item.className = "account-content-item";

                                const checkbox =
                                    document.createElement("input");
                                checkbox.type = "checkbox";
                                checkbox.id = `answer-${answer.value}`;
                                checkbox.disabled = true;
                                checkbox.checked = answer.is_correct;

                                const span = document.createElement("span");
                                span.className = "item-chechbox";
                                if (answer.is_correct) {
                                    span.classList.add("checked");
                                }
                                const label = document.createElement("label");
                                label.htmlFor = checkbox.id;
                                label.className = "item-chechbox-label";
                                label.innerHTML = answer.text;

                                item.appendChild(span);
                                item.appendChild(label);

                                container.appendChild(item);
                            });

                            const a6Div = document.getElementById("a_6");
                            if (a6Div) {
                                a6Div.appendChild(container);
                            }
                        }

                        if (data.a_7) {
                            const container = document.createElement("div");
                            container.className = "question-container";

                            const titleElement = document.createElement("div");
                            titleElement.innerHTML = data.a_7.title;
                            container.appendChild(titleElement);

                            data.a_7.answers.forEach((answer) => {
                                const item = document.createElement("div");
                                item.className = "account-content-item";

                                const checkbox =
                                    document.createElement("input");
                                checkbox.type = "checkbox";
                                checkbox.id = `answer-${answer.value}`;
                                checkbox.disabled = true;
                                checkbox.checked = answer.is_correct;

                                const span = document.createElement("span");
                                span.className = "item-chechbox";
                                if (answer.is_correct) {
                                    span.classList.add("checked");
                                }
                                const label = document.createElement("label");
                                label.htmlFor = checkbox.id;
                                label.className = "item-chechbox-label";
                                label.innerHTML = answer.text;

                                item.appendChild(span);
                                item.appendChild(label);

                                container.appendChild(item);
                            });

                            const a7Div = document.getElementById("a_7");
                            if (a7Div) {
                                a7Div.appendChild(container);
                            }
                        }
                        if (data.a_8) {
                            const container = document.createElement("div");
                            container.className = "account-content";

                            const titleElement = document.createElement("div");
                            titleElement.className = "account-subtitle-ctn";
                            titleElement.innerHTML = data.a_8.title;
                            container.appendChild(titleElement);

                            var answera8 = data.a_8.answers.filter(
                                (answer) => answer.is_correct == true,
                            );
                            if (answera8[0]) {
                                var item = document.createElement("div");
                                item.className = "account-content-toggle";

                                var checkbox = document.createElement("input");
                                checkbox.type = "checkbox";
                                checkbox.className = "checkbox-tick";

                                checkbox.id = `answer-${answera8[0].value}`;
                                checkbox.disabled = true;
                                if (answera8[0].text.toLowerCase() == "yes") {
                                    checkbox.checked = answera8[0].is_correct;
                                }
                                const label = document.createElement("label");
                                label.htmlFor = `answer-${answera8[0].value}`;
                                label.className = "item-chechbox-label";
                                label.innerHTML =
                                    '<div class="toggle-icon-on toggle-icon"><img class="toogle-button" src="//shop-uk.cialistogether.com/cdn/shop/t/22/assets/yes-toggle-button.svg?v=45665156451938296241719327512" width="80" height="40" alt="toogle button"></div><div class="toggle-icon-of toggle-icon"><img class="toogle-button" src="//shop-uk.cialistogether.com/cdn/shop/t/22/assets/no-toggle-button.svg?v=32838907917297757371719327511" width="80" height="40" alt="toogle button"></div>';

                                item.appendChild(checkbox);
                                item.appendChild(label);
                                container.appendChild(item);
                            } else {
                                var answeroptiona8 = data.a_8.answers.filter(
                                    (answer) => answer.is_correct == false,
                                );
                                if (answeroptiona8[0]) {
                                    var item = document.createElement("div");
                                    item.className = "account-content-toggle";

                                    var checkbox =
                                        document.createElement("input");
                                    checkbox.type = "checkbox";
                                    checkbox.className = "checkbox-tick";
                                    checkbox.id = `answer-${answeroptiona8[0].value}`;
                                    checkbox.disabled = true;
                                    const label =
                                        document.createElement("label");
                                    label.htmlFor = `answer-${answeroptiona8[0].value}`;
                                    label.className = "item-chechbox-label";
                                    label.innerHTML =
                                        '<div class="toggle-icon-on toggle-icon"><img class="toogle-button" src="//shop-uk.cialistogether.com/cdn/shop/t/22/assets/yes-toggle-button.svg?v=45665156451938296241719327512" width="80" height="40" alt="toogle button"></div><div class="toggle-icon-of toggle-icon"><img class="toogle-button" src="//shop-uk.cialistogether.com/cdn/shop/t/22/assets/no-toggle-button.svg?v=32838907917297757371719327511" width="80" height="40" alt="toogle button"></div>';
                                    item.appendChild(checkbox);
                                    item.appendChild(label);
                                    container.appendChild(item);
                                }
                            }

                            const a8Div = document.getElementById("a_8");
                            if (a8Div) {
                                a8Div.appendChild(container);
                            }
                        }
                        if (data.a_9) {
                            const container = document.createElement("div");
                            container.className = "question-container";

                            const titleElement = document.createElement("div");
                            titleElement.innerHTML = data.a_9.title;
                            container.appendChild(titleElement);

                            if (data.a_9.desc) {
                                const descElement =
                                    document.createElement("div");
                                descElement.innerHTML = data.a_9.desc;
                                container.appendChild(descElement);
                            }

                            data.a_9.answers.forEach((answer) => {
                                const item = document.createElement("div");
                                item.className = "account-content-item";

                                const checkbox =
                                    document.createElement("input");
                                checkbox.type = "checkbox";
                                checkbox.id = `answer-${answer.value}`;
                                checkbox.disabled = true;
                                checkbox.checked = answer.is_correct;

                                const span = document.createElement("span");
                                span.className = "item-chechbox";
                                if (answer.is_correct) {
                                    span.classList.add("checked");
                                }
                                const label = document.createElement("label");
                                label.htmlFor = checkbox.id;
                                label.className = "item-chechbox-label";
                                label.innerHTML = answer.text;

                                item.appendChild(span);
                                item.appendChild(label);

                                container.appendChild(item);
                            });

                            const a9Div = document.getElementById("a_9");
                            if (a9Div) {
                                a9Div.appendChild(container);
                            }
                        }
                        if (data.a_10) {
                            const container = document.createElement("div");
                            container.className = "question-container";
                            const titleElement = document.createElement("div");
                            titleElement.innerHTML = data.a_10.title;
                            container.appendChild(titleElement);
                            if (data.a_10.desc) {
                                const descElement =
                                    document.createElement("div");
                                descElement.innerHTML = data.a_10.desc;
                                container.appendChild(descElement);
                            }
                            data.a_10.answers.forEach((answer) => {
                                const item = document.createElement("div");
                                item.className = "account-content-item";

                                const checkbox =
                                    document.createElement("input");
                                checkbox.type = "checkbox";
                                checkbox.id = `answer-${answer.value}`;
                                checkbox.disabled = true;
                                checkbox.checked = answer.is_correct;
                                const span = document.createElement("span");
                                span.className = "item-chechbox";
                                if (answer.is_correct) {
                                    span.classList.add("checked");
                                }
                                const label = document.createElement("label");
                                label.htmlFor = checkbox.id;
                                label.className = "item-chechbox-label";
                                label.innerHTML = answer.text;

                                item.appendChild(span);
                                item.appendChild(label);

                                container.appendChild(item);
                            });
                            const a10Div = document.getElementById("a_10");
                            if (a10Div) {
                                a10Div.appendChild(container);
                            }
                        }
                        if (data.a_10_other) {
                            if (data.a_10_other.otherMedicine != "NA") {
                                var outerDiv = document.createElement("div");
                                outerDiv.className = "account-content-toggle";
                                var b = document.createElement("b");
                                var label = document.createElement("label");
                                label.setAttribute("for", "medical_name");
                                label.textContent = "Other Medicine: ";
                                b.appendChild(label);
                                var span = document.createElement("span");
                                span.className = "medical_username";
                                span.textContent =
                                    data.a_10_other.otherMedicine;
                                outerDiv.appendChild(b);
                                outerDiv.appendChild(span);

                                var container =
                                    document.getElementById("a_10_other");
                                container.appendChild(outerDiv);
                            }
                        }
                        if (data.a_11) {
                            const container = document.createElement("div");
                            container.className = "question-container";
                            const titleElement = document.createElement("div");
                            titleElement.innerHTML = data.a_11.title;
                            container.appendChild(titleElement);
                            if (data.a_11.desc) {
                                const descElement =
                                    document.createElement("div");
                                descElement.innerHTML = data.a_11.desc;
                                container.appendChild(descElement);
                            }
                            data.a_11.answers.forEach((answer) => {
                                const item = document.createElement("div");
                                item.className = "account-content-item";

                                const checkbox =
                                    document.createElement("input");
                                checkbox.type = "checkbox";
                                checkbox.id = `answer-${answer.value}`;
                                checkbox.disabled = true;
                                checkbox.checked = answer.is_correct;

                                const span = document.createElement("span");
                                span.className = "item-chechbox";
                                if (answer.is_correct) {
                                    span.classList.add("checked");
                                }
                                const label = document.createElement("label");
                                label.htmlFor = checkbox.id;
                                label.className = "item-chechbox-label";
                                label.innerHTML = answer.text;

                                item.appendChild(span);
                                item.appendChild(label);

                                container.appendChild(item);
                            });

                            const a11Div = document.getElementById("a_11");
                            if (a11Div) {
                                a11Div.appendChild(container);
                            }
                        }
                    } else {
                        var targetDiv =
                            document.querySelector("#hideIfDataNull");
                        var newContent = `
                        <div class="noDataDiv">
                            <p class="noDataP">You need to sucessfully checkout an order before this area is populated.</p>
                            </div>`;
                        targetDiv.innerHTML = newContent;
                    }
                })
                .finally(() => {
                    if (document.querySelector("#a_1 article p")) {
                        document
                            .querySelector(".contact-pref-content")
                            .parentNode.insertBefore(
                                document.querySelector("#a_1 article p"),
                                document.querySelector(".contact-pref-content"),
                            );
                    }
                    if (document.querySelector("#a_2 article p")) {
                        let pTag = document.querySelector("#a_2 article p");
                        pTag.id = "a_2_heading";
                        let targetParent =
                            document.querySelector("#a_2").parentNode
                                .previousElementSibling.parentNode;
                        let referenceElement =
                            document.querySelector("#a_2").parentNode
                                .previousElementSibling;
                        targetParent.insertBefore(pTag, referenceElement);
                    }
                    if (document.querySelector("#a_1_b").innerHTML != "") {
                        if (
                            document.querySelector(
                                "#a_1_b article p.account-subtitle .smaller-text",
                            )
                        ) {
                            document.querySelector(
                                "#a_1_b article p.account-subtitle .smaller-text",
                            ).innerHTML = "You confirmed the following:";
                        } else {
                            const p = document.createElement("p");
                            p.classList.add("account-subtitle");
                            p.innerHTML = "You confirmed the following:";
                            document
                                .querySelector("#a_1_b article")
                                .appendChild(p);
                        }
                        document
                            .querySelectorAll("#a_1_b ul li")
                            .forEach((list) => {
                                list.style.listStyle = "none";
                                const span = document.createElement("span");
                                span.classList.add("item-chechbox", "checked");
                                list.innerHTML =
                                    span.outerHTML + " " + list.innerHTML;
                            });
                    }
                    if (document.querySelector("#a_1_a").innerHTML != "") {
                        if (
                            document.querySelector(
                                "#a_1_a article p.account-subtitle .smaller-text",
                            )
                        ) {
                            document.querySelector(
                                "#a_1_a article p.account-subtitle .smaller-text",
                            ).innerHTML = "You confirmed the following:";
                        } else {
                            const p = document.createElement("p");
                            p.classList.add("account-subtitle");
                            p.innerHTML = "You confirmed the following:";
                            document
                                .querySelector("#a_1_a article")
                                .appendChild(p);
                        }
                        document
                            .querySelectorAll("#a_1_a ul li")
                            .forEach((list) => {
                                list.style.listStyle = "none";
                                const span = document.createElement("span");
                                span.classList.add("item-chechbox", "checked");
                                list.innerHTML =
                                    span.outerHTML + " " + list.innerHTML;
                            });
                    }
                    if (document.querySelector("#a_1_b_3").innerHTML != "") {
                        if (
                            document.querySelector(
                                "#a_1_b_3 article p.account-subtitle .smaller-text",
                            )
                        ) {
                            document.querySelector(
                                "#a_1_b_3 article p.account-subtitle .smaller-text",
                            ).innerHTML = "You confirmed the following:";
                        } else {
                            const p = document.createElement("p");
                            p.classList.add("account-subtitle");
                            p.innerHTML = "You confirmed the following:";
                            document
                                .querySelector("#a_1_b_3 article")
                                .appendChild(p);
                        }
                        document
                            .querySelectorAll("#a_1_b_3 .main-description li")
                            .forEach((list) => {
                                list.style.listStyle = "none";
                                const span = document.createElement("span");
                                span.classList.add("item-chechbox", "checked");
                                list.innerHTML =
                                    span.outerHTML + " " + list.innerHTML;
                            });
                    }
                    if (document.querySelector("#a_1_b_4").innerHTML != "") {
                        if (
                            document.querySelector(
                                "#a_1_b_4 article p.account-subtitle .smaller-text",
                            )
                        ) {
                            document.querySelector(
                                "#a_1_b_4 article p.account-subtitle .smaller-text",
                            ).innerHTML = "You confirmed the following:";
                        } else {
                            document
                                .querySelector("#a_1_b_4 article")
                                .classList.add("account-subtitle");
                            document.querySelector(
                                "#a_1_b_4 article",
                            ).innerHTML = "You confirmed the following:";
                        }
                        document
                            .querySelectorAll("#a_1_b_4 .main-description li")
                            .forEach((list) => {
                                list.style.listStyle = "none";
                                const span = document.createElement("span");
                                span.classList.add("item-chechbox", "checked");
                                list.innerHTML =
                                    span.outerHTML + " " + list.innerHTML;
                            });
                    }
                    if (a1_self) {
                        const targetElement = document.querySelector(
                            "#a_1_b .question-container .account-content-item",
                        );
                        if (targetElement) {
                            targetElement.parentNode.insertBefore(
                                div,
                                targetElement,
                            );
                        } else {
                            console.log("Target element not found");
                        }
                    }
                });
        }
    }
});
