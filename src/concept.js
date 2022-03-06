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
        },
});

app.content.title.$watch();
