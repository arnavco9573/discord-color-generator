"use client";
import { useState, useRef } from "react";
import {
  Button,
  ColorPicker,
  Title,
  Container,
  Stack,
  Group,
  Text,
} from "@mantine/core";

export default function Home() {
  const [textColor, setTextColor] = useState<string>("#000000");
  const [highlightColor, setHighlightColor] = useState<string>("#ffff00");
  const editorRef = useRef<HTMLDivElement>(null);

  // Map of hex colors to ANSI codes
  const colorToAnsi: Record<string, number> = {
    "#4f545c": 30, // Black
    "#dc322f": 31, // Red
    "#859900": 32, // Green
    "#b58900": 33, // Yellow
    "#268bd2": 34, // Blue
    "#d33682": 35, // Magenta
    "#2aa198": 36, // Cyan
    "#ffffff": 37, // White
  };

  const bgColorToAnsi: Record<string, number> = {
    "#002b36": 40,
    "#cb4b16": 41,
    "#586e75": 42,
    "#657b83": 43,
    "#839496": 44,
    "#6c71c4": 45,
    "#93a1a1": 46,
    "#fdf6e3": 47,
  };

  const applyStyle = (style: string, value: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.extractContents();

    // Remove previous styling
    const spans = selectedText.querySelectorAll("span");
    for (let i = 0; i < spans.length; i++) {
      spans[i].replaceWith(...Array.from(spans[i].childNodes));
    }

    // Apply new styling
    const span = document.createElement("span");
    span.dataset.style = style;
    span.dataset.value = value;

    if (style === "bold") {
      span.style.fontWeight = "bold";
    } else if (style === "underline") {
      span.style.textDecoration = "underline";
    } else if (style === "color") {
      span.style.color = value;
    } else if (style === "highlight") {
      span.style.backgroundColor = value;
    }

    span.appendChild(selectedText);
    range.deleteContents();
    range.insertNode(span);

    selection.removeAllRanges();
    selection.addRange(range);
  };

  const resetFormatting = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "Enter your text here...";
    }
  };

  const htmlToAnsi = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }

    if (node.nodeName === "BR") {
      return "\n";
    }

    const element = node as HTMLElement;
    let ansiCodes: string[] = [];

    // Handle styles
    if (element.dataset.style === "bold") {
      ansiCodes.push("1");
    } else if (element.dataset.style === "underline") {
      ansiCodes.push("4");
    } else if (element.dataset.style === "color") {
      const hexColor = element.dataset.value || "#000000";
      const ansiCode = colorToAnsi[hexColor.toLowerCase()] || 37;
      ansiCodes.push(ansiCode.toString());
    } else if (element.dataset.style === "highlight") {
      const hexColor = element.dataset.value || "#ffff00";
      const ansiCode = bgColorToAnsi[hexColor.toLowerCase()] || 43;
      ansiCodes.push(ansiCode.toString());
    }

    // Process child nodes
    let content = "";
    const children = Array.from(element.childNodes);
    for (const child of children) {
      content += htmlToAnsi(child);
    }

    if (ansiCodes.length > 0) {
      return `\x1b[${ansiCodes.join(";")}m${content}\x1b[0m`;
    }
    return content;
  };

  const copyToClipboard = async () => {
    if (!editorRef.current) return;

    try {
      const ansiText = htmlToAnsi(editorRef.current);
      const formattedText = `\`\`\`ansi\n${ansiText}\n\`\`\``;

      await navigator.clipboard.writeText(formattedText);
      alert("Copied ANSI text to clipboard! ✅");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Copy failed ❌");
    }
  };

  return (
    <div className="mt-5">
      <Container
        fluid
        style={{
          backgroundColor: "#282b30",
          padding: "20px",
          borderRadius: "8px",
          height: "100vh",
        }}
      >
        <Title mb="md" style={{ textAlign: "center", color: "#ffffff" }}>
          Discord ANSI Text Generator
        </Title>
        <Text
          mb="xl"
          style={{ textAlign: "center", color: "#ffffff", fontSize: "20px" }}
        >
          About
        </Text>
        <Text mb="" style={{ textAlign: "center", color: "#b9bbbe" }}>
          This is a simple app that creates colored Discord messages using the
          ANSI color codes available on the latest Discord desktop versions.
        </Text>
        <Text mb="md" style={{ textAlign: "center", color: "#b9bbbe" }}>
          To use this, write your text, select parts of it and assign colors to
          them, then copy it using the button below, and send in a Discord
          message.
        </Text>

        <Text
          mb="xl"
          style={{ textAlign: "center", color: "#ffffff", fontSize: "30px" }}
        >
          Create your text
        </Text>



        <Stack gap="md">
          {/* Formatting Buttons */}
          <Group justify="center">
            <Button color="red" onClick={resetFormatting}>
              Reset
            </Button>
            <Button onClick={() => applyStyle("bold", "")}>Bold</Button>
            <Button onClick={() => applyStyle("underline", "")}>
              Underline
            </Button>
          </Group>

          {/* Color Pickers */}
          <Group justify="center" gap="xl">
            <div>
              <Text size="sm" mb="xs" style={{ color: "#ffffff" }}>
                Text Color
              </Text>
              <ColorPicker
                format="hex"
                value={textColor}
                swatches={[
                  "#4f545c",
                  "#dc322f",
                  "#859900",
                  "#b58900",
                  "#268bd2",
                  "#d33682",
                  "#2aa198",
                  "#ffffff",
                ]}
                onChange={(color) => {
                  setTextColor(color);
                  applyStyle("color", color);
                }}
                withPicker={false}
              />
            </div>

            <div>
              <Text size="sm" mb="xs" style={{ color: "#ffffff" }}>
                Highlight Color
              </Text>
              <ColorPicker
                format="hex"
                value={highlightColor}
                swatches={[
                  "#002b36",
                  "#cb4b16",
                  "#586e75",
                  "#657b83",
                  "#839496",
                  "#6c71c4",
                  "#93a1a1",
                  "#fdf6e3",
                ]}
                onChange={(color) => {
                  setHighlightColor(color);
                  applyStyle("highlight", color);
                }}
                withPicker={false}
              />
            </div>
          </Group>

          <div
            style={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <div
              contentEditable
              suppressContentEditableWarning
              ref={editorRef}
              style={{
                minHeight: "100px",
                padding: "5px",
                border: "1px solid #444",
                borderRadius: "8px",
                backgroundColor: "#36393f",
                color: "#dcddde",
                width: "600px",
              }}
            >
              Enter Your Text Here.....
            </div>
          </div>

          {/* Reset & Copy Buttons */}
          <Group justify="center" gap="md">
            <Button color="green" onClick={copyToClipboard}>
              Copy Text as the Discord Formatted
            </Button>
          </Group>
        </Stack>
      </Container>
    </div>
  );
}
