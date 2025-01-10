import { Community, formatAddress, getChain } from '@anonworld/common'

export function CommunityImage({ community }: { community: Community }) {
  return (
    <div
      style={{
        background: '#050505',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 32,
        fontFamily: 'Geist',
        color: 'white',
        gap: 32,
      }}
    >
      <img
        src="https://anon.world/logo.svg"
        alt="AnonWorld"
        height={100}
        width={100}
        style={{
          display: 'flex',
          position: 'absolute',
          top: 16,
          right: 32,
        }}
      />

      {/* Main Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 32,
          width: '100%',
        }}
      >
        <img
          src={community.image_url}
          alt={community.name}
          style={{ borderRadius: 16, height: 300, width: 300 }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'pre-wrap',
            }}
          >
            {community.name}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 400,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'pre-wrap',
              opacity: 0.75,
            }}
          >
            {community.description}
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#111111',
          borderColor: '#232323',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 24,
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 400,
            opacity: 0.75,
          }}
        >
          Community Token
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 32,
            alignItems: 'center',
          }}
        >
          {community.token.image_url && (
            <img
              src={community.token.image_url}
              alt={community.token.name}
              width={100}
              height={100}
              style={{
                borderColor: '#232323',
                borderWidth: 1.5,
                borderRadius: 100,
              }}
            />
          )}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 600,
              }}
            >
              {community.token.symbol}
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 400,
                opacity: 0.75,
              }}
            >
              {`${getChain(community.token.chain_id).name} | ${formatAddress(
                community.token.address
              )}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
