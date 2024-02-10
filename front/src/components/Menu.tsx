import ConnectButton from "./ConnectButton";
import Image from "next/image";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}
function Menu() {
  return (
    <div className="bg-grey">
      <header>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 md:justify-start md:space-x-10 lg:px-8">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <a href="/">
              <span className="sr-only">Your Company</span>
              <Image
                className=""
                src="/logo.png"
                width={70}
                height={70}
                alt=""
              />
            </a>
          </div>
          <ConnectButton />
        </div>
      </header>
    </div>
  );
}

export default Menu;
