<div align="center">
    <img src="assets/logo.png" width="40%" />
    <h1>Visual Studio Code IOC Extractor</h1>
</div>

VSIOC is a real-time Visual Studio Code extension for extracting IOCs, including domains, URLs, emails, mac addresses, and more from the active open editor.

## Usage

You can install this extension under the VS Code extensions tab by searching "vsioc" or by visiting my [publisher page](https://marketplace.visualstudio.com/publishers/battleoverflow).

Another way to install the extension is by using Visual Studio Code's built-in command prompt. You can open this prompt by pressing `ctrl + p` on your keyboard.

Once the prompt is open, you can install the extension by using the following command:

```
ext install battleoverflow.vsioc
```

Here's a full list of the IOCs currently being extracted:

-   URLs
-   IPv4 Addresses
-   IPv6 Addresses
-   Domains
-   Email Addresses
-   MD5 Hashs
-   Sha1 Hashs
-   Sha256 Hashs
-   Sha512 Hashs
-   Mac Addresses

### Notice

The underlying IOC extraction library was not created by me. If you run into any inconsistencies or issues with the IOC extraction, please refer to the library's repository [here](https://github.com/ninoseki/ioc-extractor).
