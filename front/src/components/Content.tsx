export default function Content() {
  return (
    <div className="bg-white">
      {/* Alternating Feature Sections */}
      <div className="relative overflow-hidden pt-16 pb-32">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-gray-100"
        />
        <div className="relative">
          <div className="lg:mx-auto lg:grid lg:max-w-7xl  lg:gap-24 lg:px-8">
            <div className="mx-auto max-w-xl px-4 sm:px-6 lg:mx-0 lg:max-w-none lg:py-16 lg:px-0">
              <div>
                <div className="mt-6">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Make with love by FiftyWei Team
                  </h2>
                  <p className="mt-4 text-lg text-gray-500">
                    We aimed to create a robust mechanism for securely sharing
                    documents on the blockchain with specific recipients. This
                    solution addresses a critical need for businesses and
                    decentralized autonomous organizations (DAOs) seeking to
                    share sensitive administrative and confidential data to a
                    selected audience. Currently, the challenge lies in sharing
                    documents on-chain while safeguarding the privacy of users.
                    We firmly believe that Secret Network s cutting-edge
                    technology can effectively address this use case by enabling
                    individuals to share documents with the assurance of privacy
                    and data encryption, thus redefining the way confidential
                    information is shared within a blockchain ecosystem.
                  </p>
                  <div className="flex gap-10">
                    <div className="mt-6">
                      <a
                        href="https://www.fiftywei.co/"
                        target="_blank"
                        className="inline-flex rounded-md border border-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-origin-border px-4 py-2 text-base font-medium text-white shadow-sm hover:from-purple-700 hover:to-indigo-700"
                      >
                        FiftyWei
                      </a>
                    </div>

                    <div className="mt-6">
                      <a
                        href="https://www.fiftywei.co/"
                        target="_blank"
                        className="inline-flex rounded-md border border-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-origin-border px-4 py-2 text-base font-medium text-white shadow-sm hover:from-purple-700 hover:to-indigo-700"
                      >
                        Github
                      </a>
                    </div>
                    <div className="mt-6">
                      <a
                        href="https://github.com/scrtlabs/Grants/issues/123"
                        target="_blank"
                        className="inline-flex rounded-md border border-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-origin-border px-4 py-2 text-base font-medium text-white shadow-sm hover:from-purple-700 hover:to-indigo-700"
                      >
                        Grant Details
                      </a>
                    </div>
                  </div>

                  <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
