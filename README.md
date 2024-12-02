# 👋 Welcome to Dooksa

> [!WARNING]  
> Please keep in mind that Dooksa is still under active development and full backward compatibility is not guaranteed before reaching v1.0.0. Dooksa is not yet recommended for production critical applications.

> Attention. This repo is not for building a website. It is for those who want to improve Dooksa. A separate repo will be made available [Create Dooksa](https://github.com/dooksajs/create-dooksa)

---

Dooksa - _**"Look This" 👀👉** (a mix of english/french as my young bilingual daughter would say :)_ - is a lighten fast, open-source, zero-dependency, lightweight, low-code, general-purpose application framework.  

## Getting Started

Start the development server

```bash
pnpm run dev
```

> ℹ️ Fun fact, the port number is [Fletcher-8](https://gchq.github.io/CyberChef/#recipe=Fletcher-8_Checksum()To_Hex('None',0)&input=ZG9va3Nh) checksum of `dooksa` 

### Preview components

http://localhost:6362/_component/:id replace the **:id** with the component id found in [components](packages/components/src/)

## Features

- **Ultrafast** 🚀 - The interpreter is highly optimised to execute the low code instructions as fast as possible.
- **Lightweight** 🪶 - The `dooksa client` preset is under 30kB. Dooksa has zero dependencies and uses only the Web Standard API.
- **Extendable** 🔌 - The plugin system is easy to extend and **Isomorphic**, meaning there is only one plugin API for both client/server side 🥳
- **Batteries Included** 🔋 - Dooksa is a complete client/server side framework, everything included, ready to deploy!
- **Accessibility** ♿ - Components includes complete ARIA attribute support, and offers built-in keyboard navigation and screen reader compatibility out of the box.

## Documentation

The documentation will be available on [dooksa.org](https://dooksa.org).

## Contributing

Contributions Welcome! You can contribute in the following ways.

- Create an Issue - Propose a new feature. Report a bug.
- Pull Request - Fix a bug and typo. Refactor the code.
- Create third-party plugins.
- Share - Share your thoughts on the Blog, Mastodon, and others.
- Make your application - Please try to use Dooksa.

For more details, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Contributors

Thanks to [all contributors](https://github.com/dooksajs/core/graphs/contributors)!

## Author

Thomas David <https://github.com/tjdav>

## License

Distributed under the AGPL-3.0 License. See [LICENSE](LICENSE) for more information.
