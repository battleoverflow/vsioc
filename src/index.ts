/*
    Owner: azazelm3dj3d (https://github.com/azazelm3dj3d)
    Project: vsioc (https://github.com/azazelm3dj3d/vsioc)
    License: GPL v3
*/

"use strict"

import * as vscode from "vscode"
import { extractIOC } from "ioc-extractor"

export function activate(context: vscode.ExtensionContext) {
    const provider = new CustomSidebarViewProvider(context.extensionUri)

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            CustomSidebarViewProvider.viewType,
            provider
        )
    )

    vscode.workspace.onDidOpenTextDocument(
        (textDocument) => {
            updateDecorationsForUri(textDocument.uri)
        },
        null,
        context.subscriptions
    )

    // Update on editor switch
    vscode.window.onDidChangeActiveTextEditor(
        (textEditor) => {
            if (textEditor === undefined) return
            updateDecorationsForUri(textEditor.document.uri)
        },
        null,
        context.subscriptions
    )

    const updateDecorationsForUri = (uriToDecorate: vscode.Uri) => {
        if (!uriToDecorate) return

        // Only process "file://" URIs
        if (uriToDecorate.scheme !== "file") return

        // Only deal with the active window
        if (!vscode.window) return

        const activeTextEditor: vscode.TextEditor | undefined =
            vscode.window.activeTextEditor

        // Only deal with the active text editor
        if (!activeTextEditor) return
        if (!activeTextEditor.document.uri.fsPath) return
    }
}

class CustomSidebarViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "vsioc.openview"

    private _view?: vscode.WebviewView

    constructor(private readonly _extensionUri: vscode.Uri) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext<unknown>,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        this._view = webviewView

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        }

        // default webview
        webviewView.webview.html = this.getHtmlContent(webviewView.webview)

        // Interval to update HTML webview, runs every seconds
        setInterval(() => {
            webviewView.webview.html = this.getHtmlContent(webviewView.webview)
        }, 1000)
    }

    private getHtmlContent(webview: vscode.Webview): string {
        const stylesheetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this._extensionUri,
                "assets",
                "style",
                "main.css"
            )
        )

        return getHtml(stylesheetUri)
    }
}

function getHtml(stylesheetUri: vscode.Uri) {
    const iocUrls = getIOCs("url")
    const iocIpv4s = getIOCs("ipv4")
    const iocIpv6s = getIOCs("ipv6")
    const iocDomains = getIOCs("domain")
    const iocEmails = getIOCs("email")
    const iocMd5s = getIOCs("md5")
    const iocSha1s = getIOCs("sha1")
    const iocSha256s = getIOCs("sha256")
    const iocSha512s = getIOCs("sha512")
    const iocMacAddresses = getIOCs("mac")

    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <link rel="stylesheet" href="${stylesheetUri}" />
      </head>
      <body>
        <section>

          <h2>URLs:</h2>
          <p>${iocUrls}</p>

          <h2>IPv4s:</h2>
          <p>${iocIpv4s}</p>

          <h2>Ipv6s:</h2>
          <p>${iocIpv6s}</p>

          <h2>Domains:</h2>
          <p>${iocDomains}</p>

          <h2>Emails:</h2>
          <p>${iocEmails}</p>

          <h2>MD5s:</h2>
          <p>${iocMd5s}</p>

          <h2>Sha1s:</h2>
          <p>${iocSha1s}</p>

          <h2>Sha256s:</h2>
          <p>${iocSha256s}</p>

          <h2>Sha512s:</h2>
          <p>${iocSha512s}</p>

          <h2>Mac Addresses:</h2>
          <p>${iocMacAddresses}</p>

        </section>
      </body>
		</html>
  `
}

function getIOCs(typeOfIoc: string): string {
    const activeTextEditor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor

    if (!activeTextEditor) return "None"

    const document: vscode.TextDocument = activeTextEditor.document

    switch (typeOfIoc) {
        case "url":
            return JSON.stringify(iocExtractor(document, "url"))
        case "ipv4":
            return JSON.stringify(iocExtractor(document, "ipv4"))
        case "ipv6":
            return JSON.stringify(iocExtractor(document, "ipv6"))
        case "domain":
            return JSON.stringify(iocExtractor(document, "domain"))
        case "email":
            return JSON.stringify(iocExtractor(document, "email"))
        case "md5":
            return JSON.stringify(iocExtractor(document, "md5"))
        case "sha1":
            return JSON.stringify(iocExtractor(document, "sha1"))
        case "sha256":
            return JSON.stringify(iocExtractor(document, "sha256"))
        case "sha512":
            return JSON.stringify(iocExtractor(document, "sha512"))
        case "mac":
            return JSON.stringify(iocExtractor(document, "mac"))
        default:
            return JSON.stringify(iocExtractor(document, ""))
    }
}

const iocExtractor = (
    document: vscode.TextDocument,
    typeOfIoc: string
): string[] => {
    const documentHandler = extractIOC(document.getText())

    switch (typeOfIoc) {
        case "url":
            return documentHandler.urls
        case "ipv4":
            return documentHandler.ipv4s
        case "ipv6":
            return documentHandler.ipv6s
        case "domain":
            return documentHandler.domains
        case "email":
            return documentHandler.emails
        case "md5":
            return documentHandler.md5s
        case "sha1":
            return documentHandler.sha1s
        case "sha256":
            return documentHandler.sha256s
        case "sha512":
            return documentHandler.sha512s
        case "mac":
            return documentHandler.macAddresses
        default:
            return []
    }
}

// Deactivate extension
export function deactivate() {}
