import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows"
import xfceSkeleton from '../../../resources/images/vnc_ubuntu/xfce/xfce_small.png'
import cinnamonSkeleton from '../../../resources/images/vnc_ubuntu/cinnamon/cinnamon_small.png'
import mateSkeleton from '../../../resources/images/vnc_ubuntu/mate/mate_small.png'
import kdePlasmaSkeleton from '../../../resources/images/vnc_ubuntu/kde-plasma/kde_plasma_small.png'
import lxqtSkeleton from '../../../resources/images/vnc_ubuntu/lxqt/lxqt_small.png'
import lxdeSkeleton from '../../../resources/images/vnc_ubuntu/lxde/lxde_small.png'
import xtermSkeleton from '../../../resources/images/vnc_ubuntu/xterm/xterm_small.png'
import gnomeSkeleton from '../../../resources/images/vnc_ubuntu/gnome/gnome_small.png'
import debianXfceSkeleton from '../../../resources/images/vnc_debian/xfce/debian_xfce_small.png'
import kaliHeadlessSkeleton from '../../../resources/images/vnc_kali/headless/kali_headless_small.png'
import kaliLargeSkeleton from '../../../resources/images/vnc_kali/large/kali_large_small.png'
import seleniumChromeSkeleton from '../../../resources/images/selenium/chrome/selenium_chrome_small.png'
import seleniumFirefoxSkeleton from '../../../resources/images/selenium/firefox/selenium_firefox_small.png'
import android9Skeleton from '../../../resources/images/android/9/android_9_small.png'
import android10Skeleton from '../../../resources/images/android/10/android_10_small.png'
import android11Skeleton from '../../../resources/images/android/11/android_11_small.png'
import android12Skeleton from '../../../resources/images/android/12/android_12_small.png'
import android13Skeleton from '../../../resources/images/android/13/android_13_small.png'
import android14Skeleton from '../../../resources/images/android/14/android_14_small.png'
import workstationBaseSkeleton from '../../../resources/images/workstation/base/workstation_base_small.png'
import AndroidIcon from '@mui/icons-material/Android'
import WebIcon from '@mui/icons-material/Web'
import type { Templates, TemplateCategory } from './template'
import getOS from '../../../utils/getOS'

const os = getOS()

export const dockerContainerTemplates: Templates = new Map([
  ['xfce', {
    categoryId: 'linux',
    title: "XFCE",
    image: "pgmystery/ubuntu_vnc",
    defaultTag: "xfce",
    description: "Ubuntu with XFCE desktop via VNC.",
    vncPort: 5901,
    credentials: {
      username: '',
      password: "foobar",
    },
    github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/xfce",
    chips: ["Lightweight", "Stable"],
    IconComponent: DesktopWindowsIcon,
    skeleton: {
      title: 'XFCE',
      skeleton: xfceSkeleton,
      src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/xfce/docs/xfce_small.png',
    },
    hasAudioOutput: true,
    hasAudioInput: true,
    isOfficial: true,
  }],
  ['cinnamon', {
    categoryId: 'linux',
    title: "Cinnamon",
    image: "pgmystery/ubuntu_vnc",
    defaultTag: "cinnamon",
    description: "Ubuntu Cinnamon desktop over VNC.",
    vncPort: 5901,
    credentials: {
      username: '',
      password: "foobar",
    },
    github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/cinnamon",
    chips: ["Full desktop"],
    IconComponent: DesktopWindowsIcon,
    skeleton: {
      title: 'Cinnamon',
      skeleton: cinnamonSkeleton,
      src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/cinnamon/docs/cinnamon_small.png',
    },
    hasAudioOutput: true,
    hasAudioInput: true,
    isOfficial: true,
  }],
  ['gnome', {
    categoryId: 'linux',
    title: "GNOME",
    image: "pgmystery/ubuntu_vnc",
    defaultTag: "gnome",
    description: "Ubuntu GNOME desktop over VNC.",
    vncPort: 5901,
    credentials: {
      username: '',
      password: "foobar",
    },
    github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/gnome",
    chips: ["Minimalist", "Modern"],
    IconComponent: DesktopWindowsIcon,
    skeleton: {
      title: 'GNOME',
      skeleton: gnomeSkeleton,
      src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/gnome/docs/gnome_small.png',
    },
    hasAudioOutput: true,
    hasAudioInput: true,
    isOfficial: true,
  }],
  ['kdePlasma', {
    categoryId: 'linux',
    title: "KDE-Plasma",
    image: "pgmystery/ubuntu_vnc",
    defaultTag: "kde-plasma",
    description: 'Ubuntu KDE-Plasma desktop over VNC.',
    vncPort: 5901,
    credentials: {
      username: '',
      password: "foobar",
    },
    github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/kde-plasma",
    chips: ['Modern', 'Full desktop'],
    IconComponent: DesktopWindowsIcon,
    skeleton: {
      title: 'KDE-Plasma',
      skeleton: kdePlasmaSkeleton,
      src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/kde-plasma/docs/kde_plasma_small.png',
    },
    hasAudioOutput: true,
    hasAudioInput: true,
    isOfficial: true,
  }],
  ['lxde', {
    categoryId: 'linux',
    title: "LXDE",
    image: "pgmystery/ubuntu_vnc",
    defaultTag: "lxde",
    description: "Ubuntu LXDE desktop over VNC.",
    vncPort: 5901,
    credentials: {
      username: '',
      password: "foobar",
    },
    github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/lxde",
    chips: ['Classic', 'Lightweight'],
    IconComponent: DesktopWindowsIcon,
    skeleton: {
      title: 'LXDE',
      skeleton: lxdeSkeleton,
      src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/lxde/docs/lxde_small.png',
    },
    hasAudioOutput: true,
    hasAudioInput: true,
    isOfficial: true,
  }],
  ['lxqt', {
    categoryId: 'linux',
    title: "LXQt",
    image: "pgmystery/ubuntu_vnc",
    defaultTag: "lxqt",
    description: "Ubuntu LXQt desktop over VNC.",
    vncPort: 5901,
    credentials: {
      username: '',
      password: "foobar",
    },
    github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/lxqt",
    chips: ["Very light"],
    IconComponent: DesktopWindowsIcon,
    skeleton: {
      title: 'LXQt',
      skeleton: lxqtSkeleton,
      src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/lxqt/docs/lxqt_small.png',
    },
    hasAudioOutput: true,
    hasAudioInput: true,
    isOfficial: true,
  }],
  ['mate', {
    categoryId: 'linux',
    title: "MATE",
    image: "pgmystery/ubuntu_vnc",
    defaultTag: "mate",
    description: "Ubuntu MATE desktop over VNC.",
    vncPort: 5901,
    credentials: {
      username: '',
      password: "foobar",
    },
    github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/mate",
    chips: ["Classic"],
    IconComponent: DesktopWindowsIcon,
    skeleton: {
      title: 'MATE',
      skeleton: mateSkeleton,
      src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/mate/docs/mate_small.png',
    },
    hasAudioOutput: true,
    hasAudioInput: true,
    isOfficial: true,
  }],
  ['xterm', {
    categoryId: 'linux',
    title: "XTerm",
    image: "pgmystery/ubuntu_vnc",
    defaultTag: "xterm",
    description: "Ubuntu XTerm desktop over VNC.",
    vncPort: 5901,
    credentials: {
      username: '',
      password: "foobar",
    },
    github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/xterm",
    chips: ['terminal only', 'lightweight', 'light and fast', 'terminal emulator'],
    IconComponent: DesktopWindowsIcon,
    skeleton: {
      title: 'XTerm',
      skeleton: xtermSkeleton,
      src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/xterm/docs/xterm_small.png',
    },
    hasAudioOutput: false,
    hasAudioInput: false,
    isOfficial: true,
  }],
  ['debianXfce', {
    categoryId: 'linux',
    title: "Debian XFCE",
    image: "pgmystery/debian_xfce",
    defaultTag: "latest",
    description: "Debian Stable with XFCE desktop via VNC.",
    vncPort: 5901,
    credentials: {
      username: '',
      password: "foobar",
    },
    github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_debian/xfce",
    chips: ["Stable", "Enterprise"],
    IconComponent: DesktopWindowsIcon,
    skeleton: {
      title: 'Debian XFCE',
      skeleton: debianXfceSkeleton,
      src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_debian/xfce/docs/debian_xfce_small.png',
    },
    hasAudioOutput: true,
    hasAudioInput: true,
    isOfficial: true,
  }],

  // WORKSTATION
  ['workstationBase', {
    categoryId: 'workstation',
    title: "Base Workstation",
    image: "pgmystery/workstation-base",
    defaultTag: "latest",
    description: "Minimal development workstation with VS Code, Git, and common utilities.",
    vncPort: 5901,
    credentials: { username: '', password: "foobar" },
    github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/workstation/base",
    chips: ["Base", "Minimal Dev"],
    IconComponent: DesktopWindowsIcon,
    skeleton: {
      title: 'Workstation Base',
      skeleton: workstationBaseSkeleton,
      src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/workstation/base/docs/workstation_base_small.png',
    },
    hasAudioOutput: true,
    hasAudioInput: true,
    isOfficial: true,
  }],
  // ['workstationNode', {
  //   categoryId: 'workstation',
  //   title: "Node.js Workstation",
  //   image: "pgmystery/workstation-node",
  //   defaultTag: "latest",
  //   description: "Node.js development environment with VS Code, npm, pnpm, and Chrome.",
  //   vncPort: 5901,
  //   credentials: { username: '', password: "foobar" },
  //   github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/workstation/node",
  //   chips: ["Node", "React", "Next.js", "TypeScript"],
  //   IconComponent: DesktopWindowsIcon,
  //   skeleton: {
  //     title: 'Workstation Node',
  //     skeleton: workstationBaseSkeleton,
  //     src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/workstation/node/docs/workstation_node_small.png',
  //   },
  //   hasAudioOutput: true,
  //   hasAudioInput: true,
  //   isOfficial: true,
  // }],
  // ['workstationPython', {
  //   categoryId: 'workstation',
  //   title: "Python Workstation",
  //   image: "pgmystery/workstation-python",
  //   defaultTag: "latest",
  //   description: "Python development workstation with pip, poetry, JupyterLab, and VS Code.",
  //   vncPort: 5901,
  //   credentials: { username: '', password: "foobar" },
  //   github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/workstation/python",
  //   chips: ["Python", "Backend", "Data Science"],
  //   IconComponent: DesktopWindowsIcon,
  //   skeleton: {
  //     title: 'Workstation Python',
  //     skeleton: workstationBaseSkeleton,
  //     src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/workstation/python/docs/workstation_python_small.png',
  //   },
  //   hasAudioOutput: true,
  //   hasAudioInput: true,
  //   isOfficial: true,
  // }],
  // ['workstationAI', {
  //   categoryId: 'workstation',
  //   title: "AI / ML Workstation",
  //   image: "pgmystery/workstation-ai",
  //   defaultTag: "latest",
  //   description: "AI development environment with Python, PyTorch (CPU), Transformers, and Jupyter.",
  //   vncPort: 5901,
  //   credentials: { username: '', password: "foobar" },
  //   github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/workstation/ai",
  //   chips: ["AI", "ML", "LLM", "Jupyter"],
  //   IconComponent: DesktopWindowsIcon,
  //   skeleton: {
  //     title: 'Workstation AI',
  //     skeleton: workstationBaseSkeleton,
  //     src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/workstation/ai/docs/workstation_ai_small.png',
  //   },
  //   extraFlags: [
  //     '--gpus all'
  //   ],
  //   hasAudioOutput: true,
  //   hasAudioInput: true,
  //   isOfficial: true,
  // }],
  // ['workstationFullstack', {
  //   categoryId: 'workstation',
  //   title: "Fullstack Workstation",
  //   image: "pgmystery/workstation-fullstack",
  //   defaultTag: "latest",
  //   description: "Complete fullstack environment with Node.js, Python, Docker CLI, and PostgreSQL client.",
  //   vncPort: 5901,
  //   credentials: { username: '', password: "foobar" },
  //   github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/workstation/fullstack",
  //   chips: ["Fullstack", "Node", "Python", "Docker"],
  //   IconComponent: DesktopWindowsIcon,
  //   skeleton: {
  //     title: 'Workstation Fullstack',
  //     skeleton: workstationBaseSkeleton,
  //     src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/workstation/fullstack/docs/workstation_fullstack_small.png',
  //   },
  //   hasAudioOutput: true,
  //   hasAudioInput: true,
  //   isOfficial: true,
  // }],
  // ['workstationJava', {
  //   categoryId: 'workstation',
  //   title: "Java Workstation",
  //   image: "pgmystery/workstation-java",
  //   defaultTag: "jdk21",
  //   description: "Java development environment with OpenJDK 21, Maven, Gradle, and VS Code.",
  //   vncPort: 5901,
  //   credentials: { username: '', password: "foobar" },
  //   github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/workstation/java",
  //   chips: ["Java", "Maven", "Gradle"],
  //   IconComponent: DesktopWindowsIcon,
  //   skeleton: {
  //     title: 'Workstation Java',
  //     skeleton: workstationBaseSkeleton,
  //     src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/workstation/java/docs/workstation_java_small.png',
  //   },
  //   hasAudioOutput: true,
  //   hasAudioInput: true,
  //   isOfficial: true,
  // }],
  // ['workstationGo', {
  //   categoryId: 'workstation',
  //   title: "Go Workstation",
  //   image: "pgmystery/workstation-go",
  //   defaultTag: "latest",
  //   description: "Go development environment with Go toolchain and VS Code.",
  //   vncPort: 5901,
  //   credentials: { username: '', password: "foobar" },
  //   github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/workstation/go",
  //   chips: ["Go", "Backend", "Microservices"],
  //   IconComponent: DesktopWindowsIcon,
  //   skeleton: {
  //     title: 'Workstation Go',
  //     skeleton: workstationBaseSkeleton,
  //     src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/workstation/go/docs/workstation_go_small.png',
  //   },
  //   hasAudioOutput: true,
  //   hasAudioInput: true,
  //   isOfficial: true,
  // }],
  // ['workstationRust', {
  //   categoryId: 'workstation',
  //   title: "Rust Workstation",
  //   image: "pgmystery/workstation-rust",
  //   defaultTag: "latest",
  //   description: "Rust development environment with rustup, cargo, and VS Code.",
  //   vncPort: 5901,
  //   credentials: { username: '', password: "foobar" },
  //   github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/workstation/rust",
  //   chips: ["Rust", "Cargo", "Systems"],
  //   IconComponent: DesktopWindowsIcon,
  //   skeleton: {
  //     title: 'Workstation Rust',
  //     skeleton: workstationBaseSkeleton,
  //     src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/workstation/rust/docs/workstation_rust_small.png',
  //   },
  //   hasAudioOutput: true,
  //   hasAudioInput: true,
  //   isOfficial: true,
  // }],
  // ['workstationDevOps', {
  //   categoryId: 'workstation',
  //   title: "DevOps Workstation",
  //   image: "pgmystery/workstation-devops",
  //   defaultTag: "latest",
  //   description: "DevOps environment with Docker CLI, Terraform, Ansible, kubectl, and AWS CLI.",
  //   vncPort: 5901,
  //   credentials: { username: '', password: "foobar" },
  //   github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/workstation/devops",
  //   chips: ["DevOps", "Terraform", "Kubernetes", "AWS"],
  //   IconComponent: DesktopWindowsIcon,
  //   skeleton: {
  //     title: 'Workstation DevOps',
  //     skeleton: workstationBaseSkeleton,
  //     src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/workstation/devops/docs/workstation_devops_small.png',
  //   },
  //   hasAudioOutput: true,
  //   hasAudioInput: true,
  //   isOfficial: true,
  // }],
  ['kaliHeadless', {
    categoryId: 'workstation',
    title: "Kali Linux Headless",
    image: "pgmystery/kali_vnc",
    defaultTag: "headless",
    description: "Kali Linux rolling release with headless metapackage (core tools).",
    vncPort: 5901,
    credentials: {
      username: '',
      password: "foobar",
    },
    github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_kali/headless",
    chips: ["Security", "Pentesting", "Headless"],
    IconComponent: DesktopWindowsIcon,
    skeleton: {
      title: 'Kali Linux Headless',
      skeleton: kaliHeadlessSkeleton,
      src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_kali/headless/docs/kali_headless_small.png',
    },
    hasAudioOutput: false,
    hasAudioInput: false,
    isOfficial: true,
  }],
  ['kaliLarge', {
    categoryId: 'workstation',
    title: "Kali Linux Large",
    image: "pgmystery/kali_vnc",
    defaultTag: "large",
    description: "Kali Linux rolling release with KDE Plasma desktop and extensive tools.",
    vncPort: 5901,
    credentials: {
      username: '',
      password: "foobar",
    },
    github: "https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_kali/large",
    chips: ["Security", "Pentesting", "KDE Plasma", "Full Tools"],
    IconComponent: DesktopWindowsIcon,
    skeleton: {
      title: 'Kali Linux Large',
      skeleton: kaliLargeSkeleton,
      src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_kali/large/docs/kali_large_small.png',
    },
    hasAudioOutput: true,
    hasAudioInput: true,
    isOfficial: true,
  }],

  // ANDROID
  ['dockerAndroid14', {
    categoryId: 'android',
    title: "Android Emulator 14.0",
    image: "budtmo/docker-android",
    defaultTag: "emulator_14.0",
    description:
      "Android 14 emulator with VNC + optional ADB port exposed. Perfect for UI testing.",
    vncPort: 5900,
    github: "https://github.com/budtmo/docker-android",
    chips: ["ADB", "Emulator", "Debug"],
    IconComponent: AndroidIcon,
    skeleton: {
      title: "Android Emulator 14.0",
      skeleton: android14Skeleton,
    },
    extraFlags: [
      os === "windows" || os === 'mac' ? "--device /dev/kvm" : "",
      "-e EMULATOR_DEVICE=\"Samsung Galaxy S10\"",
    ],
    requireKvm: os === "windows" || os === 'mac',
  }],
  ['dockerAndroid13', {
    categoryId: 'android',
    title: "Android Emulator 13.0",
    image: "budtmo/docker-android",
    defaultTag: "emulator_13.0",
    description:
      "Android 13 emulator with VNC + optional ADB port exposed. Perfect for UI testing.",
    vncPort: 5900,
    github: "https://github.com/budtmo/docker-android",
    chips: ["ADB", "Emulator", "Debug"],
    IconComponent: AndroidIcon,
    skeleton: {
      title: "Android Emulator 13.0",
      skeleton: android13Skeleton,
    },
    extraFlags: [
      os === "windows" || os === 'mac' ? "--device /dev/kvm" : "",
      "-e EMULATOR_DEVICE=\"Samsung Galaxy S10\"",
    ],
    requireKvm: os === "windows" || os === 'mac',
  }],
  ['dockerAndroid12', {
    categoryId: 'android',
    title: "Android Emulator 12.0",
    image: "budtmo/docker-android",
    defaultTag: "emulator_12.0",
    description:
      "Android 12 emulator with VNC + optional ADB port exposed. Perfect for UI testing.",
    vncPort: 5900,
    github: "https://github.com/budtmo/docker-android",
    chips: ["ADB", "Emulator", "Debug"],
    IconComponent: AndroidIcon,
    skeleton: {
      title: "Android Emulator 12.0",
      skeleton: android12Skeleton,
    },
    extraFlags: [
      os === "windows" || os === 'mac' ? "--device /dev/kvm" : "",
      "-e EMULATOR_DEVICE=\"Samsung Galaxy S10\"",
    ],
    requireKvm: os === "windows" || os === 'mac',
  }],
  ['dockerAndroid11', {
    categoryId: 'android',
    title: "Android Emulator 11.0",
    image: "budtmo/docker-android",
    defaultTag: "emulator_11.0",
    description:
      "Android 11 emulator with VNC + optional ADB port exposed. Perfect for UI testing.",
    vncPort: 5900,
    github: "https://github.com/budtmo/docker-android",
    chips: ["ADB", "Emulator", "Debug"],
    IconComponent: AndroidIcon,
    skeleton: {
      title: "Android Emulator 11.0",
      skeleton: android11Skeleton,
    },
    extraFlags: [
      os === "windows" || os === 'mac' ? "--device /dev/kvm" : "",
      "-e EMULATOR_DEVICE=\"Samsung Galaxy S10\"",
    ],
    requireKvm: os === "windows" || os === 'mac',
  }],
  ['dockerAndroid10', {
    categoryId: 'android',
    title: "Android Emulator 10.0",
    image: "budtmo/docker-android",
    defaultTag: "emulator_10.0",
    description:
      "Android 10 emulator with VNC + optional ADB port exposed. Perfect for UI testing.",
    vncPort: 5900,
    github: "https://github.com/budtmo/docker-android",
    chips: ["ADB", "Emulator", "Debug"],
    IconComponent: AndroidIcon,
    skeleton: {
      title: "Android Emulator 10.0",
      skeleton: android10Skeleton,
    },
    extraFlags: [
      os === "windows" || os === 'mac' ? "--device /dev/kvm" : "",
      "-e EMULATOR_DEVICE=\"Samsung Galaxy S10\"",
    ],
    requireKvm: os === "windows" || os === 'mac',
  }],
  ['dockerAndroid09', {
    categoryId: 'android',
    title: "Android Emulator 9.0",
    image: "budtmo/docker-android",
    defaultTag: "emulator_9.0",
    description:
      "Android 9.0 emulator with VNC + optional ADB port exposed. Perfect for UI testing.",
    vncPort: 5900,
    github: "https://github.com/budtmo/docker-android",
    chips: ["ADB", "Emulator", "Debug"],
    IconComponent: AndroidIcon,
    skeleton: {
      title: "Android Emulator 9.0",
      skeleton: android9Skeleton,
    },
    extraFlags: [
      os === "windows" || os === 'mac' ? "--device /dev/kvm" : "",
      "-e EMULATOR_DEVICE=\"Samsung Galaxy S10\"",
    ],
    requireKvm: os === "windows" || os === 'mac',
  }],

  // SELENIUM
  ['seleniumChrome', {
    categoryId: 'selenium',
    title: "Selenium Chrome",
    image: "selenium/standalone-chrome",
    defaultTag: "latest",
    description: "Selenium Grid single-node Chrome. VNC enabled for visual debugging.",
    vncPort: 5900,
    chips: ["QA", "CI"],
    IconComponent: WebIcon,
    skeleton: {
      title: 'Selenium Chrome',
      skeleton: seleniumChromeSkeleton,
    },
    extraFlags: [
      '-p 4444:4444',
      '-e VNC_NO_PASSWORD=1',
    ],
  }],
  ['seleniumFirefox', {
    categoryId: 'selenium',
    title: "Selenium Firefox",
    image: "selenium/standalone-firefox",
    defaultTag: "latest",
    description: "Selenium Grid single-node Firefox. VNC enabled for visual debugging.",
    vncPort: 5900,
    chips: ["QA", "CI"],
    IconComponent: WebIcon,
    skeleton: {
      title: 'Selenium Firefox',
      skeleton: seleniumFirefoxSkeleton,
    },
    extraFlags: [
      '-p 4444:4444',
      '-e VNC_NO_PASSWORD=1',
    ],
  }],
])

export const defaultTemplates: TemplateCategory[] = [
  {
    id: "linux",
    label: "Linux Desktops",
    IconComponent: DesktopWindowsIcon,
    templates: filterByCategory(dockerContainerTemplates, 'linux'),
  },
  {
    id: "workstation",
    label: "Workstations",
    IconComponent: DesktopWindowsIcon,
    templates: filterByCategory(dockerContainerTemplates, 'workstation'),
  },
  {
    id: 'android',
    label: 'Android',
    IconComponent: AndroidIcon,
    templates: filterByCategory(dockerContainerTemplates, 'android'),
  },
  {
    id: 'selenium',
    label: 'Selenium',
    IconComponent: WebIcon,
    templates: filterByCategory(dockerContainerTemplates, 'selenium'),
  },
]

function filterByCategory(
  templates: Templates,
  categoryId: string
): Templates {
  return new Map(
    Array.from(templates.entries()).filter(
      ([_, template]) => template.categoryId === categoryId
    )
  );
}
