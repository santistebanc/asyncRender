const count = $(0);

const app = $({
  page: "home",
  content: () =>
    $.page() === "home"
      ? {
          title: "home",
          content: () => "counter: " + count(),
        }
      : {
          title: "about",
          content: () => "the page is: " + $.page(),
        },
});

$(app.content.title).map((val) => console.log(val));
