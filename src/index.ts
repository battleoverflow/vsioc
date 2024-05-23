/*
    Owner: battleoverflow (https://github.com/battleoverflow)
    Project: vsioc (https://github.com/battleoverflow/vsioc)
    License: GPL v3
*/

"use strict"

import * as vscode from "vscode"
import { extractIOC } from "ioc-extractor"

export const activate = (context: vscode.ExtensionContext) => {
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

    // Small message to signify the activation of the extension
    // Apparently, VS Code decided to not include new lines in their notification API for the corner notifications
    // So for now, we're just gonna have to put everything on the same line
    const githubUrl = "github.com/battleoverflow"

    vscode.window
        .showInformationMessage("VSIOC Activated", githubUrl)
        .then((selection) => {
            if (selection === githubUrl) {
                vscode.env.openExternal(
                    vscode.Uri.parse(`https://${githubUrl}`)
                )
            }
        })
}

class CustomSidebarViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "vsioc.openview"

    private _view?: vscode.WebviewView

    constructor(private readonly _extensionUri: vscode.Uri) {}

    resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
        this._view = webviewView

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        }

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

const getHtml = (stylesheetUri: vscode.Uri) => {
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

const getIOCs = (typeOfIoc: string): string => {
    const activeTextEditor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor

    if (!activeTextEditor) return "None"

    const document: vscode.TextDocument = activeTextEditor.document

    // Extract IOCs based on the type of IOC
    return JSON.stringify(iocExtractor(document, typeOfIoc))
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
export const deactivate = () => {}
