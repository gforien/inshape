"use strict";

miro.onReady(() => {
  miro.initialize({
    extensionPoints: {
      toolbar: {
        title: 'InShapes v1',
        toolbarSvgIcon: '<circle cx="12" cy="12" r="9" fill="red" fill-rule="evenodd" stroke="currentColor" stroke-width="2"></circle>',
        librarySvgIcon: '<circle cx="12" cy="12" r="9" fill="red" fill-rule="evenodd" stroke="currentColor" stroke-width="2"></circle>',
        onClick: async () => {
          // miro.board.ui.openLeftSidebar('sidebar.html')

          miro.board.ui.openModal("modal.html", { width: 400, height: 200 });
          // .then(()=>{
          //   miro.showNotification("modal closed")
          // });
        },
      },
    },
  });
});