(function() {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var clientSlug = script.getAttribute("data-client");
  if (!clientSlug) { console.error("OphidianChat: data-client required"); return; }

  var position = script.getAttribute("data-position") || "bottom-right";
  var color = script.getAttribute("data-color") || "#39ff14";
  var host = script.src.split("/chat/embed.js")[0];
  var isOpen = false;
  var iframe = null;
  var button = null;
  var container = null;

  function createChatSvg() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z");
    svg.appendChild(path);
    return svg;
  }

  function createCloseSvg() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    var line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line1.setAttribute("x1", "18"); line1.setAttribute("y1", "6");
    line1.setAttribute("x2", "6"); line1.setAttribute("y2", "18");
    var line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line2.setAttribute("x1", "6"); line2.setAttribute("y1", "6");
    line2.setAttribute("x2", "18"); line2.setAttribute("y2", "18");
    svg.appendChild(line1);
    svg.appendChild(line2);
    return svg;
  }

  function createStyles() {
    var style = document.createElement("style");

    var isLeft = position === "bottom-left";
    var hPos = isLeft ? "left: 24px;" : "right: 24px;";
    var containerHPos = isLeft ? "left: 24px;" : "right: 24px;";

    var css = [
      ".ophidian-chat-btn {",
      "  position: fixed;",
      "  " + hPos,
      "  bottom: 24px;",
      "  width: 56px;",
      "  height: 56px;",
      "  border-radius: 50%;",
      "  background: " + color + ";",
      "  color: #000;",
      "  border: none;",
      "  cursor: pointer;",
      "  z-index: 999998;",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  box-shadow: 0 4px 16px rgba(0,0,0,0.24);",
      "  transition: transform 0.2s ease;",
      "  padding: 0;",
      "}",
      ".ophidian-chat-btn:hover {",
      "  transform: scale(1.1);",
      "}",
      ".ophidian-chat-container {",
      "  position: fixed;",
      "  " + containerHPos,
      "  bottom: 86px;",
      "  width: 380px;",
      "  height: 560px;",
      "  border-radius: 12px;",
      "  box-shadow: 0 8px 32px rgba(0,0,0,0.28);",
      "  z-index: 999999;",
      "  display: none;",
      "  overflow: hidden;",
      "  background: #fff;",
      "}",
      ".ophidian-chat-container.open {",
      "  display: block;",
      "}",
      ".ophidian-chat-iframe {",
      "  width: 100%;",
      "  height: 100%;",
      "  border: none;",
      "  display: block;",
      "}",
      "@media (max-width: 768px) {",
      "  .ophidian-chat-container {",
      "    inset: 0;",
      "    width: 100%;",
      "    height: 100%;",
      "    bottom: 0;",
      "    right: 0;",
      "    left: 0;",
      "    top: 0;",
      "    border-radius: 0;",
      "  }",
      "}"
    ].join("\n");

    style.textContent = css;
    document.head.appendChild(style);
  }

  function createButton() {
    button = document.createElement("button");
    button.className = "ophidian-chat-btn";
    button.setAttribute("aria-label", "Open chat");
    button.setAttribute("type", "button");
    button.appendChild(createChatSvg());
    button.addEventListener("click", toggle);
    document.body.appendChild(button);
  }

  function createContainer() {
    container = document.createElement("div");
    container.className = "ophidian-chat-container";
    container.setAttribute("role", "dialog");
    container.setAttribute("aria-label", "Chat widget");

    iframe = document.createElement("iframe");
    iframe.className = "ophidian-chat-iframe";
    iframe.src = host + "/chat/" + clientSlug + "/widget";
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("title", "Chat widget");
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups");

    container.appendChild(iframe);
    document.body.appendChild(container);
  }

  function toggle() {
    isOpen = !isOpen;

    if (isOpen) {
      container.classList.add("open");
      button.setAttribute("aria-label", "Close chat");
      while (button.firstChild) {
        button.removeChild(button.firstChild);
      }
      button.appendChild(createCloseSvg());
    } else {
      container.classList.remove("open");
      button.setAttribute("aria-label", "Open chat");
      while (button.firstChild) {
        button.removeChild(button.firstChild);
      }
      button.appendChild(createChatSvg());
    }
  }

  window.addEventListener("message", function(event) {
    if (event.data && event.data.type === "ophidian-resize" && container && iframe) {
      try {
        var url = new URL(iframe.src);
        if (event.origin !== url.origin) return;
      } catch(e) { return; }
    }
  });

  var eventListeners = {};

  window.OphidianChat = {
    open: function() { if (!isOpen) toggle(); },
    close: function() { if (isOpen) toggle(); },
    destroy: function() {
      if (container && container.parentNode) container.parentNode.removeChild(container);
      if (button && button.parentNode) button.parentNode.removeChild(button);
      container = null;
      button = null;
      iframe = null;
    },
    on: function(event, callback) {
      if (!eventListeners[event]) eventListeners[event] = [];
      eventListeners[event].push(callback);
    },
  };

  function init() {
    createStyles();
    createButton();
    createContainer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
